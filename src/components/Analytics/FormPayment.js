import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import { useSelector } from 'react-redux'
import { selectDiscount, selectPlan, selectPromo, selectToken } from '../../redux/contract-slice'
import { FormTextItem } from './FormTextItem'
import { subtractDiscount } from '../../core/utils'
import { subscribeData, subscribeWithPromoCodeData } from '../../core/web3'
import { walletConnect } from '../../core/wallet-connect'
import { useState } from 'react'
import { selectTopic, selectUserAddress } from '../../redux/wallet-connect-slice'
import Icon from '../Icon'

function FormPayment() {
  const plan = useSelector(selectPlan)
  const promo = useSelector(selectPromo)
  const discount = useSelector(selectDiscount)
  const sessionTopic = useSelector(selectTopic)
  const token = useSelector(selectToken)
  const userAddress = useSelector(selectUserAddress)

  const [formState, setFormState] = useState('')
  const [error, setError] = useState('')

  const isPending = formState === 'pending'
  const isFinished = formState === 'finished'
  const onPay = async () => {
    if (isPending) return

    setFormState('pending')

    const inputData = (promo && discount)
      ? subscribeWithPromoCodeData(plan.duration, promo)
      : subscribeData(plan.duration)

    walletConnect.sendRequest(userAddress, sessionTopic, inputData)
      .then(() => {
        setFormState('finished')
      })
      .catch(e => {
        setError(e.message)
        setFormState('error')
      })
  }

  const costFinal = (
    <div>
      {discount && <s className="text-grey-50 pe-2 small fw-semibold">
        {plan.amount} ${token.symbol}
      </s>}
      <span>{subtractDiscount(discount, plan.amount)} {token.symbol}</span>
    </div>
  )

  const form = () => (
    <div>
      <fieldset className="Pay-fieldset Pay-fieldset-padding">
        <FormTextItem className="mb-3" title="Selected Plan" value={`${plan.interval} ${plan.intervalName}`} />
        <FormTextItem className="mb-3" title="Plan expire" value={DateTime.now().plus({ days: plan.duration }).toFormat('DD')} />
        {promo && <FormTextItem className="mb-3" title="Promo Code" value={promo} />}
        <FormTextItem title="Cost" value={costFinal} yellow />
      </fieldset>
      {error && <div className="row">
        <div className="col">
          <div className="mt-2 text-danger">{error}</div>
        </div>
      </div>}
      <button className="Button Button-yellow Button-circle mt-4 w-100 border-0 justify-content-center" onClick={onPay} disabled={isPending}>
        Pay
      </button>
    </div>
  )

  const finish = (
    <div>
      <div className="Pay-fieldset Pay-fieldset-padding text-center">
        <div className="pt-3">
          <Icon name="checkmark" />
        </div>
        <div className="fs-4 fw-semibold mt-3 mb-4">
          Payment completed
        </div>
        <div className="text-grey-50 fs-6">
          Now you can go to the Unstoppable Wallet and use the analytics tools
        </div>
      </div>
      <Link to="/analytics-profile" className="Button Button-yellow Button-circle mt-4 w-100 border-0 justify-content-center">
        View Profile
      </Link>
    </div>
  )

  return (
    <div className="Pay-content-body">
      {isFinished ? finish : form()}
    </div>
  )
}

export default FormPayment
