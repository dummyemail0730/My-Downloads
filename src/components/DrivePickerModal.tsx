import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderOpen, X, File as FileIcon, ExternalLink, Play, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';
import { getAccessToken, googleSignIn, initAuth } from '../lib/googleAuth';
import { openGooglePicker, PickedDriveFile, PickerViewMode } from '../lib/googlePicker';

interface DrivePickerButtonProps {
  viewMode?: PickerViewMode;
  multiselect?: boolean;
  label?: string;
  className?: string;
  onFilesPicked?: (files: PickedDriveFile[]) => void;
  showPickedPreviewModal?: boolean;
}

export default function DrivePickerTrigger({
  viewMode = 'all',
  multiselect = true,
  label = 'Google Picker',
  className = '',
  onFilesPicked,
  showPickedPreviewModal = true,
}: DrivePickerButtonProps) {
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isOpeningPicker, setIsOpeningPicker] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pickedFiles, setPickedFiles] = useState<PickedDriveFile[]>([]);
  const [previewFile, setPreviewFile] = useState<PickedDriveFile | null>(null);

  useEffect(() => {
    const unsub = initAuth(
      (_user, accessToken) => {
        setToken(accessToken);
      },
      () => {
        setToken(null);
      }
    );
    return () => unsub();
  }, []);

  const launchPickerWithToken = async (oauthToken: string) => {
    setErrorMsg('');
    setIsOpeningPicker(true);
    try {
      const files = await openGooglePicker({
        accessToken: oauthToken,
        multiselect,
        viewMode,
      });
      if (files.length > 0) {
        if (onFilesPicked) {
          onFilesPicked(files);
        }
        if (showPickedPreviewModal) {
          setPickedFiles(files);
          if (files.length === 1) {
            setPreviewFile(files[0]);
          }
        }
      }
    } catch (err: any) {
      console.error('Google Picker error:', err);
      setErrorMsg(err?.message || 'Unable to open Google Picker.');
      setShowAuthModal(true);
    } finally {
      setIsOpeningPicker(false);
    }
  };

  const handleTriggerClick = async () => {
    setErrorMsg('');
    const currentToken = getAccessToken() || token;
    if (!currentToken) {
      setShowAuthModal(true);
      return;
    }
    await launchPickerWithToken(currentToken);
  };

  const handleSignInAndPick = async () => {
    setIsSigningIn(true);
    setErrorMsg('');
    try {
      const result = await googleSignIn();
      if (result?.accessToken) {
        setToken(result.accessToken);
        setShowAuthModal(false);
        await launchPickerWithToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setErrorMsg(err?.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={isOpeningPicker}
        className={
          className ||
          'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-950/75 hover:bg-indigo-900/80 border border-indigo-400/50 text-indigo-100 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-60'
        }
        title="Pick files from Google Drive"
      >
        <FolderOpen className="w-4 h-4 text-indigo-300" />
        <span>{isOpeningPicker ? 'Opening Picker...' : label}</span>
      </button>

      {/* Sign in with Google Modal for Google Picker */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAuthModal(false)}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#0e081f] border border-fuchsia-500/40 p-6 shadow-[0_0_50px_rgba(168,85,247,0.35)] text-white relative"
            >
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Connect Google Drive Picker</h3>
                  <p className="text-xs text-slate-400">
                    Sign in with Google to browse and select files from your Drive.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 px-3 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col items-center gap-3">
                <GoogleSignInButton
                  onClick={handleSignInAndPick}
                  loading={isSigningIn}
                  label="Sign in with Google"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Picked Files & Preview Modal */}
      <AnimatePresence>
        {pickedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setPickedFiles([]);
              setPreviewFile(null);
            }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl bg-[#0b0718] border border-fuchsia-500/40 shadow-[0_0_60px_rgba(168,85,247,0.35)] text-white overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-fuchsia-500/20 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Picked from Google Drive ({pickedFiles.length})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Select any file below to preview or open directly in Drive.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerClick}
                    className="px-3 py-1.5 rounded-lg bg-fuchsia-600/80 hover:bg-fuchsia-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Pick More
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPickedFiles([]);
                      setPreviewFile(null);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Picked File List */}
                <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto p-3 space-y-2 max-h-[32vh] md:max-h-full">
                  {pickedFiles.map((file) => {
                    const isSelected = previewFile?.id === file.id;
                    const isAudio = file.mimeType.startsWith('audio/');
                    const isVideo = file.mimeType.startsWith('video/');
                    return (
                      <div
                        key={file.id}
                        onClick={() => setPreviewFile(file)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-fuchsia-950/60 border-fuchsia-400/70'
                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300">
                            {isAudio ? (
                              <Music className="w-4 h-4" />
                            ) : isVideo ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <FileIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{file.mimeType}</p>
                          </div>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-fuchsia-600/50 text-slate-300 hover:text-white transition-colors shrink-0"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  })}
                </div>

                {/* Live Drive Embed Preview Pane */}
                <div className="md:col-span-7 bg-black/80 flex flex-col min-h-[300px]">
                  {previewFile ? (
                    <iframe
                      key={previewFile.id}
                      src={previewFile.embedUrl || `https://drive.google.com/file/d/${previewFile.id}/preview`}
                      title={previewFile.name}
                      allow="autoplay; encrypted-media"
                      className="w-full h-full flex-1 border-0 min-h-[340px]"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                      <Play className="w-8 h-8 text-fuchsia-400 mb-2" />
                      <p className="text-xs font-medium">
                        Select a picked file to preview it directly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
