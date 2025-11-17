/**
 * Firebase MCP Server
 * Model Context Protocol integration for Firebase
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

interface FirestoreCollection {
  name: string;
  fields: FirestoreField[];
  documentCount: number;
}

interface FirestoreField {
  name: string;
  type: string;
  isArray: boolean;
  isRequired: boolean;
}

/**
 * Firebase MCP Server Class
 */
export class FirebaseMCPServer {
  private app: admin.app.App | null = null;
  private db: admin.firestore.Firestore | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initialize(): void {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const apiKey = process.env.FIREBASE_API_KEY;
      const databaseURL = process.env.FIREBASE_DATABASE_URL;

      if (!projectId || !apiKey) {
        console.warn('Firebase credentials not configured');
        return;
      }

      // Initialize with project ID and credentials
      this.app = admin.initializeApp({
        projectId,
        databaseURL,
      });

      this.db = admin.firestore();
      this.isInitialized = true;

      console.log(`Firebase MCP Server initialized for project: ${projectId}`);
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }

  /**
   * Get all Firestore collections and their schemas
   */
  async getSchema(): Promise<FirestoreCollection[]> {
    if (!this.db) {
      throw new Error('Firebase not initialized');
    }

    try {
      const collections = await this.db.listCollections();
      const schema: FirestoreCollection[] = [];

      for (const collection of collections) {
        const fields = await this.inferCollectionSchema(collection.id);
        const snapshot = await collection.limit(1).get();

        schema.push({
          name: collection.id,
          fields,
          documentCount: snapshot.size,
        });
      }

      return schema;
    } catch (error: any) {
      throw new Error(`Failed to get schema: ${error.message}`);
    }
  }

  /**
   * Infer schema from collection documents
   */
  private async inferCollectionSchema(collectionName: string): Promise<FirestoreField[]> {
    if (!this.db) {
      throw new Error('Firebase not initialized');
    }

    try {
      const snapshot = await this.db.collection(collectionName).limit(10).get();

      if (snapshot.empty) {
        return [];
      }

      const fieldMap = new Map<string, { types: Set<string>; count: number }>();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        Object.entries(data).forEach(([key, value]) => {
          if (!fieldMap.has(key)) {
            fieldMap.set(key, { types: new Set(), count: 0 });
          }
          const field = fieldMap.get(key)!;
          field.types.add(this.getFirestoreType(value));
          field.count++;
        });
      });

      const fields: FirestoreField[] = [];
      fieldMap.forEach((value, key) => {
        const types = Array.from(value.types);
        fields.push({
          name: key,
          type: types.join(' | '),
          isArray: types.includes('array'),
          isRequired: value.count === snapshot.size,
        });
      });

      return fields;
    } catch (error: any) {
      throw new Error(`Failed to infer schema: ${error.message}`);
    }
  }

  /**
   * Get Firestore data type
   */
  private getFirestoreType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (value instanceof admin.firestore.Timestamp) return 'timestamp';
    if (value instanceof admin.firestore.GeoPoint) return 'geopoint';
    if (value && typeof value === 'object') return 'map';
    return typeof value;
  }

  /**
   * Generate TypeScript types from Firestore schema
   */
  async generateTypes(): Promise<string> {
    const schema = await this.getSchema();
    let types = '// Generated TypeScript types from Firestore\n\n';

    for (const collection of schema) {
      const interfaceName = this.toPascalCase(collection.name);

      types += `export interface ${interfaceName} {\n`;
      types += `  id: string;\n`;

      for (const field of collection.fields) {
        const optional = field.isRequired ? '' : '?';
        const type = this.mapFirestoreTypeToTS(field.type);
        types += `  ${field.name}${optional}: ${type};\n`;
      }

      types += `}\n\n`;
    }

    return types;
  }

  /**
   * Map Firestore types to TypeScript
   */
  private mapFirestoreTypeToTS(firestoreType: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      timestamp: 'Date',
      geopoint: '{ latitude: number; longitude: number }',
      array: 'any[]',
      map: 'Record<string, any>',
      null: 'null',
    };

    if (firestoreType.includes(' | ')) {
      const types = firestoreType.split(' | ');
      return types.map((t) => typeMap[t.trim()] || 'any').join(' | ');
    }

    return typeMap[firestoreType] || 'any';
  }

  /**
   * Generate React hooks for a collection
   */
  async generateHooks(collectionName: string): Promise<string> {
    const schema = await this.getSchema();
    const collection = schema.find((c) => c.name === collectionName);

    if (!collection) {
      throw new Error(`Collection ${collectionName} not found`);
    }

    const typeName = this.toPascalCase(collectionName);

    return `// Generated React hooks for ${collectionName} collection

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase'; // Import your Firebase config

export interface ${typeName} {
  id: string;
${collection.fields.map((f) => `  ${f.name}${f.isRequired ? '' : '?'}: ${this.mapFirestoreTypeToTS(f.type)};`).join('\n')}
}

/**
 * Hook to get all ${collectionName} documents with realtime updates
 */
export function use${typeName}s() {
  const [data, setData] = useState<${typeName}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, '${collectionName}'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ${typeName}[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as ${typeName}));
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to get a single ${collectionName} document by ID
 */
export function use${typeName}(id: string) {
  const [data, setData] = useState<${typeName} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, '${collectionName}', id),
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as ${typeName});
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return { data, loading, error };
}

/**
 * Hook to create a new ${collectionName} document
 */
export function useCreate${typeName}() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: Omit<${typeName}, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, '${collectionName}'), data);
      setLoading(false);
      return docRef.id;
    } catch (err: any) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { create, loading, error };
}

/**
 * Hook to update a ${collectionName} document
 */
export function useUpdate${typeName}() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (id: string, data: Partial<Omit<${typeName}, 'id'>>) => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, '${collectionName}', id), data);
      setLoading(false);
    } catch (err: any) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { update, loading, error };
}

/**
 * Hook to delete a ${collectionName} document
 */
export function useDelete${typeName}() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteDoc = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, '${collectionName}', id));
      setLoading(false);
    } catch (err: any) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { delete: deleteDoc, loading, error };
}
`;
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Check if Firebase is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Create singleton instance
export const firebaseMCPServer = new FirebaseMCPServer();
