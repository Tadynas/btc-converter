const apiURL = 'https://api.coindesk.com/v1/bpi/currentprice.json'

const fetchCurrentPrice = async () => {
  const response = await fetch(apiURL)
  return await response.json()
}
export default fetchCurrentPrice;