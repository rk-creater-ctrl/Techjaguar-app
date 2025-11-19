'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, VideoOff, AlertTriangle, Disc, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedRecording {
  name: string;
  url: string;
  date: string;
}

export default function GoLivePage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Media Devices API not supported.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: 'Your browser does not support the necessary technology for live streaming.',
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleToggleStreaming = () => {
    if (isStreaming) {
      if (isRecording) {
        handleStopRecording();
      }
      setIsStreaming(false);
      // Don't stop tracks here if we want to restart the stream
    } else {
      if (hasCameraPermission && streamRef.current) {
        if (videoRef.current) {
          // Re-attach stream if it's not already
           if (!videoRef.current.srcObject) {
             videoRef.current.srcObject = streamRef.current;
           }
        }
        setIsStreaming(true);
      } else if (hasCameraPermission === false) {
        toast({
          variant: 'destructive',
          title: 'Cannot Start Stream',
          description: 'Camera permission is required to start streaming.',
        });
      }
    }
  };

  const handleStartRecording = () => {
    if (streamRef.current && isStreaming) {
      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm; codecs=vp9' };
      try {
         mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      } catch (e) {
         console.error('Error creating MediaRecorder:', e);
         toast({
            variant: 'destructive',
            title: 'Recording Error',
            description: 'Could not start recording. Your browser may not support the recording format.',
         });
         return;
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const newRecording: SavedRecording = {
          name: recordingName || `Recording ${new Date().toLocaleString()}`,
          url: url,
          date: new Date().toLocaleString(),
        };
        setSavedRecordings(prev => [newRecording, ...prev]);
        setRecordingName('');
        toast({
          title: 'Recording Saved',
          description: `"${newRecording.name}" has been saved.`,
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Go Live</h1>
          <p className="text-muted-foreground">
            Start a live session, record it, and manage your recordings.
          </p>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Live Stream</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {hasCameraPermission === false && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
                            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                            <h3 className="text-lg font-semibold">Camera Access Required</h3>
                            <p className="text-muted-foreground">Please grant permission to use your camera to go live.</p>
                        </div>
                    )}
                    {hasCameraPermission === null && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                            <p>Requesting camera permission...</p>
                        </div>
                    )}
                    {isStreaming && (
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                             <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-sm font-medium text-white bg-black/50 px-2 py-1 rounded-md">Live</span>
                        </div>
                    )}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button size="lg" onClick={handleToggleStreaming} disabled={hasCameraPermission === null || hasCameraPermission === false}>
                    {isStreaming ? (
                        <>
                        <VideoOff className="mr-2" /> Stop Streaming
                        </>
                    ) : (
                        <>
                        <Video className="mr-2" /> Start Streaming
                        </>
                    )}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Enter recording name..." 
                            value={recordingName}
                            onChange={(e) => setRecordingName(e.target.value)}
                            disabled={!isStreaming || isRecording}
                            className="w-full sm:w-auto"
                        />
                        {isRecording ? (
                            <Button size="lg" onClick={handleStopRecording} variant="destructive">
                                <Square className="mr-2" /> Stop Recording
                            </Button>
                        ) : (
                            <Button size="lg" onClick={handleStartRecording} disabled={!isStreaming}>
                                <Disc className="mr-2 animate-pulse" /> Start Recording
                            </Button>
                        )}
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Saved Recordings</CardTitle>
                </CardHeader>
                <CardContent>
                    {savedRecordings.length > 0 ? (
                        <ul className="space-y-4">
                            {savedRecordings.map((rec, index) => (
                                <li key={index} className="flex flex-col p-3 border rounded-lg">
                                    <span className="font-semibold">{rec.name}</span>
                                    <span className="text-sm text-muted-foreground">{rec.date}</span>
                                    <a href={rec.url} download={rec.name + '.webm'} className="text-sm text-primary hover:underline mt-2">
                                        Download
                                    </a>
                                     <video src={rec.url} controls className="mt-2 rounded-md" />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No recordings saved yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
