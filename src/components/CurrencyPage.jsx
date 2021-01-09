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
    
    if(amount.match(/^[0-9]*(?:\.[0-9]*)?$/)) {
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
    <div>
      <h1>BTC Converter</h1>
      <input type="text" value={btcAmount} onChange={handleBtcAmountChange} />
      <button onClick={handleDropdownState}>+</button>
      {
        openDropdown &&
        <div>
          {
            currencies.map((currency) => (
              !currency.active && 
              <div key={currency.name} onClick={() => { handleCurrencyState(currency.name, true) }}>
                <span>{currency.name}</span>
                <span> 1 : {currency.exchangeRate} </span>
              </div>
            ))
          }
        </div>
      }
      {
        currencies.map((currency) => {
          if(currency.active) {
            return (
              <div key={currency.name}>
                <span>{currency.name}</span>
                <Currency
                  quantity={currency.amount} 
                  symbol={currency.symbol}
                />
                <button onClick={() => { handleCurrencyState(currency.name, false) }}>X</button>
              </div>
            )
          } else {
            return false
          }
        })
      }
      <p>Last updated: {lastUpdated}</p>
    </div>
  )
}

export default CurrencyPage