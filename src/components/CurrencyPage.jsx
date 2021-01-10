import React, { useState, useEffect } from 'react'
import Currency from 'react-currency-formatter'

import fetchCurrentPrice from '../api/coindesk'

const CurrencyPage = () => {

  const [btcAmount, setBtcAmount] = useState(0)
  const [openDropdown, setOpenDropdown] = useState(false)
  const [currencies, setCurrencies] = useState([
    {
      name: 'USD',
      exchangeRate: '',
      exchangeRateFloat: 0,
      amount: 0,
      symbol: '$',
      active: true
    },
    {
      name: 'EUR',
      exchangeRate: '',
      exchangeRateFloat: 0,
      amount: 0,
      symbol: '€',
      active: true
    },
    {
      name: 'GBP',
      exchangeRate: '',
      exchangeRateFloat: 0,
      amount: 0,
      symbol: '£',
      active: true
    }
  ])
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    fetchExchangeRate()

    const repeater = setInterval(() => {
      fetchExchangeRate()
    }, 1000 * 60)
    return () => clearInterval(repeater)
  }, [])

  useEffect(() => {
    setCurrencies((prevCurrencies) => (
      prevCurrencies.map((currency) => {
        const updatedAmount = btcAmount * currency.exchangeRateFloat
        return { ...currency, amount: updatedAmount }
      })
    ))
  }, [lastUpdated, btcAmount])

  const fetchExchangeRate = () => {
    fetchCurrentPrice().then((data) => {
      setCurrencies((prevCurrencies) => (
        prevCurrencies.map((currency) => {
          const updatedRate = data.bpi[currency.name].rate
          const updatedRateFloat = parseFloat(data.bpi[currency.name].rate_float)
          return { ...currency, exchangeRate: updatedRate, exchangeRateFloat: updatedRateFloat }
        })
      ))
      
      setLastUpdated(data.time.updateduk)
    })
  }

  const handleBtcAmountChange = (e) => {
    const amount = e.target.value
    
    if(amount.match(/^[0-9]*(?:\.[0-9]*)?$/) && (amount === '' || parseFloat(amount) < 1000000)) {
      setBtcAmount(amount)
    }
  }

  const handleDropdownState = () => {
    setOpenDropdown((prevState) => !prevState )
  }

  const handleCurrencyState = (currencyName, state) => {
    setCurrencies((prevCurrencies) => (
      prevCurrencies.map((currency) => (
        currency.name === currencyName ? { ...currency, active: state } : currency
      ))
    ))
  }

  return (
    <section className="currency">
      <div className="container container--full-height">
        <div className="currency__wrapper">
          <h1>BTC Converter</h1>
          <div className="currency__card">
            <div className="currency__card__decoration">
              <div className="decoration__left"></div>
              <div className="decoration__right"></div>
            </div>
            <h2 className="currency__card__title">Type amount:</h2>
            <div className="currency__card__amount">
              <input type="text" value={btcAmount} onChange={handleBtcAmountChange} className="amount__input" />
            </div>
          </div>
          <p className="currency__last-updated">Last updated: {lastUpdated}</p>
          <div className="currency__list">
            {
              currencies.map((currency) => {
                if(currency.active) {
                  return (
                    <div key={currency.name} className="item">
                      <span className={"item__name " + currency.name.toLowerCase()}>{currency.name}</span>
                      <span className="item__amount">
                        <Currency
                          quantity={currency.amount} 
                          symbol={currency.symbol}
                        />
                      </span>
                      <button onClick={() => { handleCurrencyState(currency.name, false) }} className="remove-btn"></button>
                    </div>
                  )
                } else {
                  return false
                }
              })
            }
          </div>
          {
            currencies.filter((currency) => currency.active === false).length > 0 &&
            <div className="currency__dropdown">
            <button onClick={handleDropdownState} className={openDropdown ? 'currency__dropdown__btn arrow-btn active' : 'currency__dropdown__btn arrow-btn'}>Add currency</button>
              {
                openDropdown &&
                  currencies.map((currency) => (
                    !currency.active && 
                    <div key={currency.name} className="item">
                      <span className={"item__name " + currency.name.toLowerCase()}>{currency.name} : BTC</span>
                      <span className="item__amount">{currency.exchangeRate} : 1</span>
                      <button onClick={() => { handleCurrencyState(currency.name, true) }} className="add-btn"></button>
                    </div>
                  ))
              }
            </div>
          }
        </div>
      </div>
    </section>
  )
}

export default CurrencyPage