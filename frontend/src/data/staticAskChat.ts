import type { ChatMessageData } from '../components/workspace/ChatMessage'

/** Static seed thread — models come later */
export const STATIC_ASK_MESSAGES: ChatMessageData[] = [
  {
    id: 'a1',
    role: 'assistant',
    text: 'Attach a GeoTIFF to start. I will show a preview on the right. Answers from models come in a later step.',
  },
]
