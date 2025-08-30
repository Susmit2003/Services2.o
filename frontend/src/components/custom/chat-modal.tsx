"use client";

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie'; // Import the js-cookie library
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, MapPin, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { uploadImage } from '@/lib/actions/cloudinary.actions';
import { useToast } from '@/hooks/use-toast';
import type { Message, Booking } from '@/types';
import { getChatHistory } from '@/lib/actions/chat.actions';

interface ChatModalProps {
  booking: Booking;
  otherUser: {
    id: string;
    name: string;
    profileImage?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const ChatMessage = ({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) => {
  const renderContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <a href={message.content} target="_blank" rel="noopener noreferrer">
            <img src={message.content} alt="Shared content" className="rounded-lg max-w-xs cursor-pointer" />
          </a>
        );
      case 'location':
        try {
            const { latitude, longitude } = JSON.parse(message.content);
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) return <p className="text-destructive-foreground">Google Maps API Key is missing.</p>;
            const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=300x200&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
            
            // ✅ FIX: Use the correct Google Maps URL format with template literals
            const clickableMapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

            return (
               <a href={clickableMapUrl} target="_blank" rel="noopener noreferrer">
                <img src={mapImageUrl} alt="Shared location" className="rounded-lg max-w-xs cursor-pointer" />
              </a>
            );
        } catch (error) {
            return <p className="text-destructive-foreground">Invalid location data.</p>
        }
      default:
        return <p className="text-sm break-words">{message.content}</p>;
    }
  };

  return (
    <div className={`flex items-end gap-2 my-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-3 rounded-lg max-w-[80%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export function ChatModal({ booking, otherUser, isOpen, onClose }: ChatModalProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Effect to scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }
  }, [messages]);

  // Effect to manage Socket.IO connection
  useEffect(() => {
    if (!isOpen || !currentUser || !booking) return;

        const fetchHistory = async () => {
        setIsLoadingHistory(true);
        const history = await getChatHistory(booking.id);
        setMessages(history);
        setIsLoadingHistory(false);
    };
    fetchHistory();

    // Use the js-cookie library to read the token, consistent with auth-context
    const token = Cookies.get('authToken');

    if (!token) {
        toast({ title: "Authentication Error", description: "Auth token not found. Please log in again.", variant: "destructive" });
        return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace("/api", ""); // Correctly remove /api for the socket URL

    const newSocket = io(socketUrl, {
      withCredentials: true,
      auth: { token }
    });
    setSocket(newSocket);
    
    newSocket.on('connect_error', (err) => {
      console.error(`[ERROR] Socket connection error: ${err.message}`);
      toast({ title: "Chat Error", description: `Connection failed: ${err.message}`, variant: "destructive" });
    });

    console.log(`[CONNECT] Socket connecting to ${socketUrl} for booking: ${booking.id}`);
    newSocket.emit('joinRoom', booking.id);
    
    newSocket.on('receiveMessage', (message: Message) => {
      console.log('[RECEIVE] Message from server:', message);
      setMessages((prev) => [...prev, message]);
    });
    
    return () => {
      console.log(`[DISCONNECT] Socket disconnecting for booking: ${booking.id}`);
      newSocket.disconnect();
    };
  }, [isOpen, booking, currentUser, toast]);

  const sendMessage = (messageType: 'text' | 'image' | 'location', content: string) => {
    if (!socket || !content.trim() || !currentUser) return;
    const messageData = {
      bookingId: booking.id,
      sender: currentUser._id,
      messageType,
      content,
    };
    socket.emit('sendMessage', messageData);
  };

  const handleSendText = () => { sendMessage('text', newMessage); setNewMessage(''); };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await uploadImage(formData, `/chat/${booking.id}`);
      if ('error' in result) throw new Error(result.error);
      sendMessage('image', result.secure_url);
    } catch (error) {
      toast({ title: 'Upload Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };
  // const handleShareLocation = () => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         sendMessage('location', JSON.stringify({ latitude, longitude }));
  //       },
  //       () => { toast({ title: 'Location Error', description: 'Could not get your location.', variant: 'destructive' }); }
  //     );
  //   } else {
  //       toast({ title: 'Location Error', description: 'Geolocation is not supported by your browser.', variant: 'destructive' });
  //   }
  // };

   const handleShareLocation = () => {
    if (navigator.geolocation) {
      // ✅ FIX: Add options to request a more accurate location
      const options = {
        enableHighAccuracy: true, // This is the key change
        timeout: 5000,            // Give the browser 5 seconds to get a fix
        maximumAge: 0             // Don't use a cached location
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendMessage('location', JSON.stringify({ latitude, longitude }));
        },
        (error) => { 
          toast({ 
            title: 'Location Error', 
            description: `Could not get location: ${error.message}`, 
            variant: 'destructive' 
          }); 
        },
        options // Pass the new options object here
      );
    } else {
        toast({ 
          title: 'Location Error', 
          description: 'Geolocation is not supported by your browser.', 
          variant: 'destructive' 
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full flex flex-col h-[calc(100vh-4rem)] sm:h-[80vh]">
        <DialogHeader className="flex-row items-center space-x-4 p-4 border-b">
          <Avatar>
            <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle>Chat with {otherUser.name}</DialogTitle>
            <DialogDescription className="sr-only">
              A real-time chat window for your conversation about booking ID {booking.id}.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        {/* <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} isCurrentUser={msg.sender === currentUser?._id} />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No messages yet.</div>
          )}
        </ScrollArea> */}
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          {/* ✅ FIX: Show a loader while fetching history */}
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg, index) => (
              <ChatMessage key={msg._id || index} message={msg} isCurrentUser={msg.sender._id === currentUser?._id} />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No messages yet.</div>
          )}
        </ScrollArea>
        
        <DialogFooter className="flex-col sm:flex-col items-stretch gap-2 p-4 border-t bg-background">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button onClick={handleSendText} disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Paperclip className="mr-2 h-4 w-4" />}
              Attach
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            <Button variant="outline" size="sm" onClick={handleShareLocation}>
              <MapPin className="mr-2 h-4 w-4" />
              Location
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}