import { Bot, LoaderCircle, UserRound } from 'lucide-react'
import { products } from '../../../data/products'
import AssistantProduct from './AssistantProduct'
import SourceList from './SourceList'

export default function AssistantMessages({ messages, profile, busy, activity, messageEndRef, onOpenProduct, onChoose }) {
  const lastMessage = messages.at(-1)
  const activeQuestionId = !busy && lastMessage?.role === 'assistant' && lastMessage.question ? lastMessage.id : null
  return (
    <div className="xiaoy-messages" aria-live="polite">
      {messages.map((message) => (
        <article key={message.id} className={`xiaoy-message ${message.role}`}>
          <span className="xiaoy-message-icon">{message.role === 'assistant' ? <Bot size={17} /> : <UserRound size={17} />}</span>
          <div className="xiaoy-message-body">
            <p>{message.content}</p>
            {message.question && (
              <div className="xiaoy-choice-group" role="group" aria-label="小Y引导选项">
                {message.question.options.map((option) => (
                  <button key={option.value} type="button" disabled={activeQuestionId !== message.id}
                    onClick={() => onChoose?.(option.label, option.value)}>
                    {option.label}
                  </button>
                ))}
                <span className="xiaoy-choice-note">
                  第 {message.question.step}/5 轮 · 可直接输入，也可以选“不确定”或跳过
                  {message.question.options.some(({ value }) => value.startsWith('route-')) ? ' · 路线只用于本次建议，不会记录性别' : ''}
                </span>
              </div>
            )}
            {message.productIds?.length > 0 && (
              <div className="xiaoy-products">
                {message.productIds.map((id) => {
                  const product = products.find((item) => item.id === id)
                  return product ? <AssistantProduct key={id} product={product} profile={profile} onOpenProduct={onOpenProduct}
                    factOnly={message.sources?.some((source) => source.kind === 'product' && source.productId === id)} /> : null
                })}
              </div>
            )}
            {message.skinGuidance ? <details className="xiaoy-sources">
              <summary>观察依据与局限</summary>
              <p>根据你描述的日常出油位置、两颊干燥程度和出现频率，判断当前肤质倾向。季节、环境和护理可能影响感受，可以随实际变化调整。</p>
              <SourceList sources={message.sources} />
            </details> : <SourceList sources={message.sources} />}
          </div>
        </article>
      ))}
      {busy && <article className="xiaoy-message assistant loading"><span className="xiaoy-message-icon"><Bot size={17} /></span><div className="xiaoy-message-body"><p><LoaderCircle size={16} />{activity}</p></div></article>}
      <div ref={messageEndRef} />
    </div>
  )
}
