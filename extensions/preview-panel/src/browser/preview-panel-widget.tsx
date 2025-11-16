/**
 * Preview Panel Widget
 * Live React Native preview with Expo Snack
 */

import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core/lib/common/message-service';
import { PreviewService } from '../common/preview-service';
import QRCode from 'qrcode.react';

export const PREVIEW_PANEL_ID = 'preview-panel';
export const PREVIEW_PANEL_LABEL = 'Preview';

type DeviceType = 'ios' | 'android' | 'web';

@injectable()
export class PreviewPanelWidget extends ReactWidget {
  static readonly ID = PREVIEW_PANEL_ID;
  static readonly LABEL = PREVIEW_PANEL_LABEL;

  @inject(MessageService)
  protected readonly messageService!: MessageService;

  @inject(PreviewService)
  protected readonly previewService!: PreviewService;

  protected snackUrl: string | null = null;
  protected device: DeviceType = 'web';
  protected showQR = false;
  protected isLoading = false;

  @postConstruct()
  protected init(): void {
    this.id = PREVIEW_PANEL_ID;
    this.title.label = PREVIEW_PANEL_LABEL;
    this.title.caption = PREVIEW_PANEL_LABEL;
    this.title.closable = true;
    this.title.iconClass = 'fa fa-mobile';

    // Listen for preview updates
    this.previewService.onPreviewUpdate((data: any) => {
      this.snackUrl = data.snackUrl;
      this.update();
    });

    this.update();
  }

  protected async refreshPreview(): Promise<void> {
    if (!this.snackUrl) {
      this.messageService.warn('No preview available. Generate code first.');
      return;
    }

    this.isLoading = true;
    this.update();

    // Wait a bit for the iframe to reload
    setTimeout(() => {
      this.isLoading = false;
      this.update();
    }, 1000);
  }

  protected setDevice(device: DeviceType): void {
    this.device = device;
    this.update();
  }

  protected toggleQR(): void {
    this.showQR = !this.showQR;
    this.update();
  }

  protected getPreviewUrl(): string {
    if (!this.snackUrl) {
      return '';
    }

    const url = new URL(this.snackUrl);
    url.searchParams.set('platform', this.device);
    url.searchParams.set('theme', 'dark');
    url.searchParams.set('preview', 'true');
    url.searchParams.set('supportedPlatforms', 'ios,android,web');

    return url.toString();
  }

  protected render(): React.ReactNode {
    return (
      <div className="preview-panel">
        {/* Header */}
        <div className="preview-header">
          <h3>Live Preview</h3>
          <div className="header-controls">
            <button
              onClick={() => this.refreshPreview()}
              disabled={!this.snackUrl || this.isLoading}
              title="Refresh Preview"
            >
              🔄
            </button>
            <button
              onClick={() => this.toggleQR()}
              disabled={!this.snackUrl}
              title="Show QR Code"
              className={this.showQR ? 'active' : ''}
            >
              📱 QR
            </button>
          </div>
        </div>

        {/* Device Selector */}
        {this.snackUrl && (
          <div className="device-selector">
            <button
              className={`device-button ${this.device === 'ios' ? 'active' : ''}`}
              onClick={() => this.setDevice('ios')}
            >
              🍎 iOS
            </button>
            <button
              className={`device-button ${this.device === 'android' ? 'active' : ''}`}
              onClick={() => this.setDevice('android')}
            >
              🤖 Android
            </button>
            <button
              className={`device-button ${this.device === 'web' ? 'active' : ''}`}
              onClick={() => this.setDevice('web')}
            >
              🌐 Web
            </button>
          </div>
        )}

        {/* Loading */}
        {this.isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading preview...</p>
          </div>
        )}

        {/* QR Code Modal */}
        {this.showQR && this.snackUrl && (
          <div className="qr-modal">
            <div className="qr-content">
              <button className="close-button" onClick={() => this.toggleQR()}>
                ✕
              </button>
              <h4>Scan with Expo Go</h4>
              <div className="qr-code">
                <QRCode value={this.snackUrl} size={200} />
              </div>
              <p className="qr-instructions">
                1. Install Expo Go from App Store or Play Store
                <br />
                2. Scan this QR code
                <br />
                3. Preview runs on your phone!
              </p>
              <div className="qr-link">
                <input type="text" value={this.snackUrl} readOnly />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(this.snackUrl!);
                    this.messageService.info('Copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {this.snackUrl ? (
          <div className="preview-container">
            <iframe
              src={this.getPreviewUrl()}
              className="preview-iframe"
              title="Expo Snack Preview"
              allow="geolocation; microphone; camera; accelerometer; gyroscope"
            />
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📱</div>
            <h4>No Preview Available</h4>
            <p>Generate code from Figma to see live preview here</p>
            <div className="empty-steps">
              <div className="step">1️⃣ Open Figma Explorer</div>
              <div className="step">2️⃣ Select elements</div>
              <div className="step">3️⃣ Click "Generate Code"</div>
              <div className="step">4️⃣ Preview appears here!</div>
            </div>
          </div>
        )}

        {/* Device Frame (optional visual enhancement) */}
        {this.snackUrl && this.device !== 'web' && (
          <div className="device-hint">
            <span>💡 Tip: Use QR code to test on real device</span>
          </div>
        )}
      </div>
    );
  }
}
