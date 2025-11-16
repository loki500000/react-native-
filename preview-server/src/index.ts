/**
 * Preview Server
 * WebSocket server for live updates and Expo Snack integration
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ExpoSnackAPI } from './expo-snack-api';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const expoSnack = new ExpoSnackAPI();

// Store active projects
const projects = new Map<string, any>();

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle code updates from IDE
  socket.on('code-update', async (data) => {
    const { projectId, files } = data;

    try {
      // Update Expo Snack
      const snackUrl = await expoSnack.createOrUpdateSnack(projectId, files);

      // Broadcast to all connected clients
      io.emit('preview-update', {
        projectId,
        snackUrl,
        files,
      });

      socket.emit('update-success', { snackUrl });
    } catch (error: any) {
      socket.emit('update-error', { error: error.message });
    }
  });

  // Handle preview requests
  socket.on('request-preview', async (data) => {
    const { projectId } = data;
    const project = projects.get(projectId);

    if (project) {
      socket.emit('preview-ready', {
        snackUrl: project.snackUrl,
        qrCode: project.qrCode,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST API endpoints
app.post('/api/preview/create', async (req, res) => {
  try {
    const { files, name } = req.body;
    const snackUrl = await expoSnack.createOrUpdateSnack(name, files);

    res.json({
      success: true,
      snackUrl,
      embedUrl: `${snackUrl}?platform=web&preview=true`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/api/preview/update', async (req, res) => {
  try {
    const { projectId, files } = req.body;
    const snackUrl = await expoSnack.createOrUpdateSnack(projectId, files);

    // Notify connected clients via WebSocket
    io.emit('preview-update', {
      projectId,
      snackUrl,
      files,
    });

    res.json({
      success: true,
      snackUrl,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`Preview server running on http://localhost:${PORT}`);
});
