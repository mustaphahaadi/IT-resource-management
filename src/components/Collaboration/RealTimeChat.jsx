import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { usePermissions } from "../../contexts/PermissionsContext"
import { apiService } from "../../services/api"
import {
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"

const RealTimeChat = ({ requestId, taskId, onClose }) => {
  const { user } = usePermissions()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [participants, setParticipants] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    fetchParticipants()
    
    // Set up real-time updates (WebSocket simulation)
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [requestId, taskId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      let response
      if (requestId) {
        response = await apiService.getRequestComments(requestId)
      } else if (taskId) {
        response = await apiService.getTaskComments(taskId)
      }
      
      if (response?.data) {
        setMessages(Array.isArray(response.data) ? response.data : response.data.results || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchParticipants = async () => {
    try {
      // Get participants based on request or task
      let response
      if (requestId) {
        response = await apiService.getSupportRequest(requestId)
        const request = response.data
        const participantsList = [
          request.requester,
          request.assigned_to
        ].filter(Boolean)
        setParticipants(participantsList)
      } else if (taskId) {
        response = await apiService.getTask(taskId)
        const task = response.data
        const participantsList = [
          task.assigned_to?.user,
          task.related_request?.requester
        ].filter(Boolean)
        setParticipants(participantsList)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || loading) return

    setLoading(true)
    
    try {
      let response
      if (requestId) {
        response = await apiService.addRequestComment(requestId, newMessage.trim())
      } else if (taskId) {
        response = await apiService.addTaskComment(taskId, newMessage.trim())
      }
      
      if (response?.data) {
        setMessages(prev => [...prev, response.data])
        setNewMessage('')
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTyping = () => {
    // Simulate typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      // Clear typing indicator
    }, 3000)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const getUserInitials = (user) => {
    if (!user) return '?'
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getUserColor = (userId) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
    ]
    return colors[userId % colors.length]
  }

  const isMyMessage = (message) => {
    return message.author?.id === user?.id || message.user?.id === user?.id
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {requestId ? 'Request Discussion' : 'Task Collaboration'}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        
        {/* Participants */}
        {participants.length > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-gray-600">Participants:</span>
            <div className="flex -space-x-2">
              {participants.map((participant, index) => (
                <div
                  key={participant?.id || index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white ${getUserColor(participant?.id || 0)}`}
                  title={`${participant?.first_name || ''} ${participant?.last_name || ''}`}
                >
                  {getUserInitials(participant)}
                </div>
              ))}
            </div>
            <Badge variant="secondary" className="ml-2">
              {participants.length} online
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isMe = isMyMessage(message)
              const author = message.author || message.user
              
              return (
                <div
                  key={message.id || index}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isMe ? 'order-2' : 'order-1'}`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getUserColor(author?.id || 0)}`}>
                          {getUserInitials(author)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {author?.first_name || 'Unknown'} {author?.last_name || ''}
                        </span>
                        {author?.role && (
                          <Badge variant="outline" className="text-xs">
                            {author.role}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isMe
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.comment || message.content}</p>
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        isMe ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <ClockIcon className="w-3 h-3" />
                        <span>{formatMessageTime(message.created_at)}</span>
                        
                        {isMe && (
                          <div className="ml-auto flex items-center gap-1">
                            <CheckIcon className="w-3 h-3" />
                            <span>Sent</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || loading}
              size="sm"
              className="px-3"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </Button>
          </form>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <div className="flex items-center gap-2">
              <EyeIcon className="w-3 h-3" />
              <span>{participants.length} participants</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RealTimeChat
