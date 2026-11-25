declare global {
  interface Window {
    gapi?: {
      load: (api: string, callback: () => void) => void;
    };
    google?: {
      picker?: any;
    };
  }
}

export interface PickedDriveFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  embedUrl?: string;
  iconUrl?: string;
  sizeBytes?: number;
}

export type PickerViewMode = 'all' | 'audio' | 'video';

let gapiLoadPromise: Promise<void> | null = null;

export const loadGooglePickerApi = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Picker can only run in a browser environment.'));
  }

  if (window.google?.picker) {
    return Promise.resolve();
  }

  if (gapiLoadPromise) {
    return gapiLoadPromise;
  }

  gapiLoadPromise = new Promise<void>((resolve, reject) => {
    const loadPickerModule = () => {
      if (!window.gapi?.load) {
        gapiLoadPromise = null;
        reject(new Error('Google API client failed to initialize.'));
        return;
      }
      window.gapi.load('picker', () => {
        if (window.google?.picker) {
          resolve();
        } else {
          gapiLoadPromise = null;
          reject(new Error('Google Picker library failed to load.'));
        }
      });
    };

    if (window.gapi?.load) {
      loadPickerModule();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://apis.google.com/js/api.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', loadPickerModule, { once: true });
      existingScript.addEventListener(
        'error',
        () => {
          gapiLoadPromise = null;
          reject(new Error('Failed to load Google API script.'));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = loadPickerModule;
    script.onerror = () => {
      gapiLoadPromise = null;
      reject(new Error('Failed to load https://apis.google.com/js/api.js'));
    };
    document.head.appendChild(script);
  });

  return gapiLoadPromise;
};

export const getPickerOrigin = (): string => {
  if (
    window.location.ancestorOrigins &&
    window.location.ancestorOrigins.length > 0
  ) {
    return window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1];
  }
  return window.location.origin;
};

export const openGooglePicker = async ({
  accessToken,
  multiselect = true,
  viewMode = 'all',
}: {
  accessToken: string;
  multiselect?: boolean;
  viewMode?: PickerViewMode;
}): Promise<PickedDriveFile[]> => {
  if (!accessToken) {
    throw new Error('Google sign-in is required before opening Google Picker.');
  }

  await loadGooglePickerApi();

  const pickerApi = window.google?.picker;
  if (!pickerApi) {
    throw new Error('Google Picker API is not available.');
  }

  return new Promise<PickedDriveFile[]>((resolve) => {
    const pickerOrigin = getPickerOrigin();
    const builder = new pickerApi.PickerBuilder()
      .setOAuthToken(accessToken)
      .setOrigin(pickerOrigin);

    if (viewMode === 'audio') {
      const audioView = new pickerApi.DocsView(pickerApi.ViewId.DOCS)
        .setIncludeFolders(true)
        .setMimeTypes(
          'audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/ogg,audio/aac,audio/mp4,audio/x-m4a,audio/webm'
        );
      builder.addView(audioView);
      builder.addView(pickerApi.ViewId.DOCS);
    } else if (viewMode === 'video') {
      const videoView = new pickerApi.DocsView(pickerApi.ViewId.DOCS)
        .setIncludeFolders(true)
        .setMimeTypes(
          'video/mp4,video/webm,video/x-matroska,video/quicktime,video/ogg'
        );
      builder.addView(videoView);
      builder.addView(pickerApi.ViewId.DOCS);
    } else {
      const docsView = new pickerApi.DocsView(pickerApi.ViewId.DOCS).setIncludeFolders(true);
      builder.addView(docsView);
    }

    if (multiselect && pickerApi.Feature?.MULTISELECT_ENABLED) {
      builder.enableFeature(pickerApi.Feature.MULTISELECT_ENABLED);
    }

    builder.setCallback((data: any) => {
      if (data?.action === pickerApi.Action.PICKED && Array.isArray(data.docs)) {
        const picked: PickedDriveFile[] = data.docs.map((doc: any) => ({
          id: String(doc.id || ''),
          name: String(doc.name || 'Untitled Drive File'),
          mimeType: String(doc.mimeType || 'application/octet-stream'),
          url: String(doc.url || `https://drive.google.com/file/d/${doc.id}/view`),
          embedUrl: doc.embedUrl
            ? String(doc.embedUrl)
            : `https://drive.google.com/file/d/${doc.id}/preview`,
          iconUrl: doc.iconUrl ? String(doc.iconUrl) : undefined,
          sizeBytes: typeof doc.sizeBytes === 'number' ? doc.sizeBytes : undefined,
        }));
        resolve(picked);
      } else if (data?.action === pickerApi.Action.CANCEL) {
        resolve([]);
      }
    });

    const picker = builder.build();
    picker.setVisible(true);
  });
};
