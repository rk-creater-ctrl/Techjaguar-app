'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, VideoOff, Disc, Square, Loader2, AlertTriangle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { startLiveSession } from '@/lib/actions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


interface SavedRecording {
  name: string;
  url: string;
  date: string;
}

export default function StudioPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const isInstructor = user?.uid === process.env.NEXT_PUBLIC_INSTRUCTOR_UID;

  useEffect(() => {
    if (!isUserLoading && !isInstructor) {
      router.replace('/');
    }
  }, [isUserLoading, isInstructor, router]);

  useEffect(() => {
    if (!isInstructor) return;

    let stream: MediaStream | null = null;
    
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
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [toast, isInstructor]);

  if (isUserLoading || !isInstructor || !firestore) {
    return (
       <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleGoLive = async () => {
    if (isStreaming) {
       if (isRecording) {
        handleStopRecording();
      }
      setIsStreaming(false);
      // Here you would add logic to end the live session in Firestore
    } else {
       if (!sessionName) {
        toast({
          variant: 'destructive',
          title: 'Session Name Required',
          description: 'Please enter a name for your live session.',
        });
        return;
      }
      if (hasCameraPermission && streamRef.current) {
        if (videoRef.current) {
           if (!videoRef.current.srcObject) {
             videoRef.current.srcObject = streamRef.current;
           }
        }
        try {
          await startLiveSession(firestore, {
            title: sessionName,
            description: 'Live session in progress',
            instructorId: user.uid,
            isFree: isFree,
            meetingUrl: '#', // Placeholder
          });
          setIsStreaming(true);
           toast({
            title: 'You are now live!',
            description: 'Your session has started and users will be notified.',
          });
        } catch (error: any) {
            toast({
              variant: 'destructive',
              title: 'Could not start session',
              description: error.message || 'There was a problem starting the live session.',
            });
        }

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
          name: recordingName || sessionName || `Recording ${new Date().toLocaleString()}`,
          url: url,
          date: new Date().toLocaleString(),
        };
        setSavedRecordings(prev => [newRecording, ...prev]);
        setRecordingName('');
        toast({
          title: 'Recording Saved',
          description: `"${newRecording.name}" has been saved locally.`,
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
          <h1 className="text-3xl font-bold tracking-tight font-headline">Streaming Studio</h1>
          <p className="text-muted-foreground">
            Start a live session, record it, and manage your recordings.
          </p>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Live Preview</CardTitle>
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
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="mt-2">Requesting camera permission...</p>
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
                     {isRecording && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 text-red-500">
                             <Disc className="h-5 w-5 animate-pulse" />
                            <span className="text-sm font-medium text-white bg-black/50 px-2 py-1 rounded-md">REC</span>
                        </div>
                    )}
                </div>
                 <div className="mt-6 flex flex-col space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            placeholder="Enter session name..." 
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            disabled={isStreaming}
                            className="flex-grow"
                        />
                         <div className="flex items-center space-x-2 rounded-lg border p-4">
                            <Switch id="free-session" checked={isFree} onCheckedChange={setIsFree} disabled={isStreaming} />
                            <Label htmlFor="free-session" className="flex-grow">Free Session</Label>
                        </div>
                    </div>
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Button size="lg" onClick={handleGoLive} disabled={hasCameraPermission !== true} className="w-full sm:w-auto">
                        {isStreaming ? (
                            <>
                            <VideoOff className="mr-2" /> Stop Session
                            </>
                        ) : (
                            <>
                            <Video className="mr-2" /> Go Live
                            </>
                        )}
                        </Button>
                    
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input 
                                placeholder="Recording name (optional)..." 
                                value={recordingName}
                                onChange={(e) => setRecordingName(e.target.value)}
                                disabled={!isStreaming || isRecording}
                                className="flex-grow"
                            />
                            {isRecording ? (
                                <Button onClick={handleStopRecording} variant="destructive">
                                    <Square className="mr-2" /> Stop
                                </Button>
                            ) : (
                                <Button onClick={handleStartRecording} disabled={!isStreaming}>
                                    <Disc className="mr-2" /> Record
                                </Button>
                            )}
                        </div>
                    </div>
                 </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Local Recordings</CardTitle>
                    <CardDescription>Recordings are saved in your browser and will be lost on refresh. Download them to save permanently.</CardDescription>
                </CardHeader>
                <CardContent>
                    {savedRecordings.length > 0 ? (
                        <ul className="space-y-4 max-h-[500px] overflow-y-auto">
                            {savedRecordings.map((rec, index) => (
                                <li key={index} className="flex flex-col p-3 border rounded-lg bg-muted/50">
                                    <span className="font-semibold truncate">{rec.name}</span>
                                    <span className="text-sm text-muted-foreground">{rec.date}</span>
                                    <a href={rec.url} download={rec.name + '.webm'}>
                                       <Button variant="outline" size="sm" className="mt-2 w-full">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </a>
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
