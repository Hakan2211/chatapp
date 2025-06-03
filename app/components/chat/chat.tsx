import { Button } from '#/components/ui/button';
import { ScrollArea } from '#/components/ui/scroll-area';
import {
  RiShining2Line,
  RiAttachment2,
  RiCpuLine,
  RiArrowUpLine,
  RiMicLine,
} from '@remixicon/react';
import { ChatMessage } from '#/components/chat/chat-message';
import { useRef, useEffect, useState } from 'react';
import { cn } from '#/lib/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip';

import TextareaAutosize from 'react-textarea-autosize';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import { Separator } from '#/components/ui/separator';
import type { Message as AIMessage } from 'ai';

const groupUsers = [
  {
    id: 'u1',
    name: 'Alex',
    src: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1741345634/user-02_mlqqqt.png',
  }, // Replace with actual paths or data
  { id: 'u2', name: 'Sam', src: 'https://avatar.iran.liara.run/public/48' },
  { id: 'u3', name: 'User 3', src: 'https://avatar.iran.liara.run/public/10' }, // Example with fallback
];

export default function Chat({
  handleSubmit,
  messages,
  isLoading,
}: {
  handleSubmit: (input: string) => void;
  messages: AIMessage[];
  isLoading?: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [currentModel, setCurrentModel] = useState('GPT-4 Omni');
  const models = ['GPT-4 Omni', 'Claude 3 Opus', 'Llama 3 70B', 'Gemini Pro'];
  const [chatMode, setChatMode] = useState<'solo' | 'group'>('solo');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    // console.log(`Sending message with model ${currentModel}:`, input);
    handleSubmit(input);
    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-4 md:px-6 lg:px-8 py-5 backdrop-blur-md bg-white/10 dark:bg-black/10 border-b border-white/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <ToggleGroup
              type="single"
              value={chatMode}
              onValueChange={(val) => {
                if (val) setChatMode(val as 'solo' | 'group');
              }}
              className=" flex rounded-lg border p-1"
            >
              <ToggleGroupItem
                value="solo"
                aria-label="Solo"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted/50 data-[state=on]:bg-gradient-to-r data-[state=on]:from-pink-500/10 data-[state=on]:to-purple-500/10 data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-pink-500/20"
              >
                <User className="h-4 w-4" />
                Solo
              </ToggleGroupItem>

              <div className=" w-[2px] h-6 bg-gradient-to-b from-sky-600/20 via-purple-600/20 to-red-600/20 self-center mx-2 " />

              <ToggleGroupItem
                value="group"
                aria-label="Group"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted/50 data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500/10 data-[state=on]:to-blue-500/10 data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-blue-500/20"
              >
                <Users className="h-4 w-4" />
                Group
              </ToggleGroupItem>
            </ToggleGroup>
            {/* Conditional Avatar Stack */}
            {chatMode === 'group' && (
              <div className="flex items-center -space-x-2">
                {groupUsers.slice(0, 3).map((user) => (
                  <Avatar
                    key={user.id}
                    className="h-8 w-8 border-2 border-background"
                  >
                    <AvatarImage src={user.src ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {groupUsers.length > 3 && (
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      +{groupUsers.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0 w-full ...">
        <div className="max-w-3xl mx-auto mt-6 space-y-6 ... pb-4">
          {/* ... Today indicator ... */}
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id || index}
              isUser={message.role === 'user'}
            >
              {/* Preserve whitespace and render newlines from AI */}
              <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
            </ChatMessage>
          ))}
          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' && ( // Show loading after user's optimistic message
              <ChatMessage isUser={false}>
                <p>
                  <i>Assistant is thinking...</i>
                </p>
              </ChatMessage>
            )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      </ScrollArea>

      {/* Footer (Input Area) */}
      <div className="flex-none border-t border-white/20 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative rounded-[20px] backdrop-blur-md bg-gradient-to-t from-background to-blue-500/5 bg-blue-500/10 dark:bg-black/10 border border-white/20 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <TextareaAutosize
              className="flex w-full resize-none border-0 bg-transparent px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed"
              placeholder="Ask me anything... (Shift+Enter for newline)"
              aria-label="Enter your prompt"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              minRows={1}
              maxRows={6}
              disabled={isLoading}
            />
            {/* Textarea buttons */}
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="flex items-center gap-1">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full size-8 border-none bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all"
                        aria-label="Attach file"
                      >
                        <RiAttachment2
                          className="text-muted-foreground size-5"
                          size={20}
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>Attach File</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full size-8 border-none bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        aria-label="Audio"
                      >
                        <RiMicLine
                          className="text-muted-foreground size-5"
                          size={20}
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>RecordAudio</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={100}>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center rounded-full h-8 px-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 text-muted-foreground hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all text-sm font-medium"
                            aria-label={`Current model: ${currentModel}. Click to change.`}
                          >
                            <RiCpuLine
                              className="size-4 mr-1.5 flex-shrink-0 text-blue-400"
                              aria-hidden="true"
                            />
                            <span className="truncate max-w-[100px] sm:max-w-[150px]">
                              {currentModel}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        <p>Select Model</p>
                      </TooltipContent>
                    </Tooltip>

                    <DropdownMenuContent
                      className="w-64 backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                      align="end"
                      side="top"
                    >
                      <DropdownMenuLabel className="text-muted-foreground">
                        Select Model
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={currentModel}
                        onValueChange={setCurrentModel}
                      >
                        {models.map((model) => (
                          <DropdownMenuRadioItem
                            className="text-muted-foreground hover:bg-blue-500/20 focus:bg-blue-500/30 flex justify-between items-center"
                            key={model}
                            value={model}
                          >
                            <span>{model}</span>
                            <span className="text-xs opacity-70">
                              {model === 'GPT-4 Omni'
                                ? 'Advanced reasoning'
                                : model === 'Claude 3 Opus'
                                ? 'Creative writing'
                                : model === 'Llama 3 70B'
                                ? 'Open-source power'
                                : 'Fast responses'}
                            </span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>

              {/* Right buttons */}
              <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className={cn(
                          'flex-shrink-0 rounded-full size-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-200 disabled:opacity-50'
                        )}
                        disabled={!input.trim() || isLoading}
                        onClick={handleSend}
                        aria-label="Send message"
                      >
                        <RiArrowUpLine size={18} aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>Send Message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
