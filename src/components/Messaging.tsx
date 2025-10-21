import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from './ui/utils'

interface Conversation {
  user: any
  lastMessage?: any
  unreadCount: number
}

export const Messaging: React.FC = () => {
  const { user: currentUser } = useAuth()
  const { users, messages, addMessage, getMessagesBetween } = useData()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [currentMessages, setCurrentMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentUser) {
      // Filter users based on current user role
      let availableUsers = users.filter(u => u.id !== currentUser.id)
      
      if (currentUser.role === 'locataire') {
        // Tenants can only message managers
        availableUsers = availableUsers.filter(u => u.role === 'gestionnaire')
      } else if (currentUser.role === 'gestionnaire') {
        // Managers can message owners and tenants
        availableUsers = availableUsers.filter(u => 
          u.role === 'proprietaire' || u.role === 'locataire'
        )
      }
      // Owners can message everyone

      // Create conversations with message data
      const convs = availableUsers.map(user => {
        const userMessages = getMessagesBetween(currentUser.id, user.id)
        const lastMessage = userMessages[userMessages.length - 1]
        const unreadCount = userMessages.filter(msg => 
          msg.recipient_id === currentUser.id && !msg.read
        ).length

        return {
          user,
          lastMessage,
          unreadCount
        }
      })

      // Sort by last message date
      convs.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0
        return bTime - aTime
      })

      setConversations(convs)
    }
  }, [currentUser, users, messages])

  useEffect(() => {
    if (selectedConversation && currentUser) {
      const messagesWithUser = getMessagesBetween(currentUser.id, selectedConversation.id)
      setCurrentMessages(messagesWithUser)
    }
  }, [selectedConversation, currentUser, messages])

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || sendingMessage || !currentUser) return

    setSendingMessage(true)
    
    try {
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      addMessage({
        sender_id: currentUser.id,
        recipient_id: selectedConversation.id,
        content: newMessage.trim(),
        type: 'text',
        read: false
      })

      setNewMessage('')
      toast.success('Message envoyé')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Erreur lors de l\'envoi du message')
    } finally {
      setSendingMessage(false)
    }
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'proprietaire': return 'bg-blue-500'
      case 'gestionnaire': return 'bg-green-500'
      case 'locataire': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'proprietaire': return 'Propriétaire'
      case 'gestionnaire': return 'Gestionnaire'
      case 'locataire': return 'Locataire'
      default: return 'Utilisateur'
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg text-gray-900 dark:text-white mb-3">
            Messagerie
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation disponible'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.user.id}
                    onClick={() => setSelectedConversation(conversation.user)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors",
                      selectedConversation?.id === conversation.user.id
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={getRoleColor(conversation.user.role)}>
                            {getUserInitials(conversation.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-900 dark:text-white truncate">
                            {conversation.user.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getRoleLabel(conversation.user.role)}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={getRoleColor(selectedConversation.role)}>
                      {getUserInitials(selectedConversation.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg text-gray-900 dark:text-white">
                      {selectedConversation.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getRoleLabel(selectedConversation.role)} • En ligne
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-4">
                {currentMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aucun message encore. Commencez la conversation !
                    </p>
                  </div>
                ) : (
                  currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender_id === currentUser?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                          message.sender_id === currentUser?.id
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            message.sender_id === currentUser?.id
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <Button type="button" variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1"
                  disabled={sendingMessage}
                />
                <Button type="submit" disabled={!newMessage.trim() || sendingMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choisissez un contact pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}