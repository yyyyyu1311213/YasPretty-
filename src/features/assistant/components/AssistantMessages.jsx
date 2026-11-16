import { Bot, LoaderCircle, UserRound } from 'lucide-react'
import { products } from '../../../data/products'
import AssistantProduct from './AssistantProduct'
import SourceList from './SourceList'

export default function AssistantMessages({ messages, profile, busy, activity, messageEndRef, onOpenProduct }) {
  return (
    <div className="xiaoy-messages" aria-live="polite">
      {messages.map((message) => (
        <article key={message.id} className={`xiaoy-message ${message.role}`}>
          <span className="xiaoy-message-icon">{message.role === 'assistant' ? <Bot size={17} /> : <UserRound size={17} />}</span>
          <div className="xiaoy-message-body">
            <p>{message.content}</p>
            {message.productIds?.length > 0 && (
              <div className="xiaoy-products">
                {message.productIds.map((id) => {
                  const product = products.find((item) => item.id === id)
                  return product ? <AssistantProduct key={id} product={product} profile={profile} onOpenProduct={onOpenProduct} /> : null
                })}
              </div>
            )}
            <SourceList sources={message.sources} />
          </div>
        </article>
      ))}
      {busy && <article className="xiaoy-message assistant loading"><span className="xiaoy-message-icon"><Bot size={17} /></span><div className="xiaoy-message-body"><p><LoaderCircle size={16} />{activity}</p></div></article>}
      <div ref={messageEndRef} />
    </div>
  )
}
