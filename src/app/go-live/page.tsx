'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, VideoOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GoLivePage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
      // Cleanup: stop media tracks when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleToggleStreaming = () => {
    if (isStreaming) {
      // Stop streaming
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
       if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsStreaming(false);
    } else {
      // Start streaming
      if (hasCameraPermission && streamRef.current) {
         if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
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


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
       <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Go Live
          </h1>
          <p className="text-muted-foreground">
            Start a live session to interact with your students in real-time.
          </p>
        </div>
      </div>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Live Stream Preview</CardTitle>
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
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className={`relative flex h-3 w-3`}>
                    {isStreaming && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isStreaming ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                </span>
                <span className="text-sm font-medium text-muted-foreground">{isStreaming ? 'Live' : 'Offline'}</span>
            </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
