// CSS
import './App.css'

// React Bootstrap Components
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
// import Button from 'react-bootstrap/Button'
import Image from 'react-bootstrap/Image'
// import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import Spinner from 'react-bootstrap/Spinner'

// Font
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

// Image
import sun from './images/sun.png'

// Component
import Record from './components/Record'
import Suggestion from './components/Suggestion'

import { useState, useEffect } from 'react'

// Data
import jsonData from './data/cities_list.json'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

function App() {
  const [suggestions, setSuggestions] = useState([])
  // Conditional styling (ListGroup.Item)
  const [active, setActive] = useState('') // onMouseEnter
  // 
  const [isFocus, setIsFocus] = useState(false) // Render element when text Input is "active"
  // Data to display on page
  const [info, setInfo] = useState({
    temp: 0,
    maxTemp: 0,
    minTemp: 0,
    city: '',
    country: '',
    formattedDate: '',
    humidity: 0,
    weather: ''
  })
  const [textInput, setTextInput] = useState('')
  // Conditionally render Spinner when data's not ready
  const [isLoading, setIsLoading] = useState(false)

  // [{
  //   id: 0,
  //   city: '',
  //   country: '',
  //   lat: 0,
  //   lon: 0,
  //   formattedDate: ''
  // }, ...]
  const [history, setHistory] = useState(() => {
    const item = localStorage.getItem('history')
    if (item !== null) return JSON.parse(item)
    else return []
  })

  // returns "suggestions" (setSuggestions) Refer to cities_list.json
  const filterLocation = input => {
    const filtered = []
    for (let i = 0; i < jsonData.length; i++) {
      if (jsonData[i].name.toLowerCase().includes(input) || jsonData[i].country.toLowerCase().includes(input)) {
        filtered.push(jsonData[i])
        // Breaks out of loop
        if (filtered.length === 5) break
      }
    }
    setSuggestions(filtered)
  }

  const fetchData = (params) => {
    setIsLoading(true)
    const { lat, lon, city, country } = params

    fetch(`${process.env.REACT_APP_OPENWEATHER_API_URL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`)
      .then(res => res.json())
      .then(data => {
        const { current, daily } = data
        const maxTemp = Math.max(...daily.map(ele => ele.temp.max))
        const minTemp = Math.min(...daily.map(ele => ele.temp.min))
        const formattedDate = dayjs().tz(data.timezone).format('D MMM YYYY h:mm A')
        
        setInfo({
          temp: Math.floor(current.temp),
          maxTemp: Math.floor(maxTemp),
          minTemp: Math.floor(minTemp),
          // Time at that city
          formattedDate,
          humidity: current.humidity,
          weather: current.weather[0].main,
          city,
          country
        })
        setIsLoading(false)
        // Save to localStorage
        if (params.saveHistory) {
          const copy = [...history]
          // Generate an id (Delete)
          function generateRandomNumber() {
            return Math.floor(Math.random() * 10000); // Generates a random number between 0 and 9999 (inclusive)
          }
          copy.push({
            id: generateRandomNumber(),
            city,
            country,
            lat,
            lon,
            formattedDate
          })
          setHistory(copy)
          localStorage.setItem('history', JSON.stringify(copy))
        }
      })
      .catch(err => console.log(err))
  }

  useEffect(() => {
    document.addEventListener('click', e => {
      const inputGroupEle = document.getElementById('inputGroup')
      // Clicks outside InputGroup
      if (!inputGroupEle.contains(e.target)) {
        setIsFocus(false)
      }
    })

    fetchData({ lat: 1.28967, lon: 103.85007, city: 'Singapore', country: 'Singapore' })
  }, [])

  return (
    <Container className='pt-5'>
      <Row className='justify-content-center mx-1'>
        <Col xs={12} sm={8} className='d-flex p-0 position-relative' id='inputGroup'>
          <InputGroup>
            <InputGroup.Text className='userInputAddOn'>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </InputGroup.Text>
            <Form.Control
              type='text'
              placeholder='City / Country'
              className='userInput'
              value={textInput}
              onChange={e => {
                setTextInput(e.target.value)
                const input = e.target.value.toLowerCase()

                if (input.length > 2) filterLocation(input.toLowerCase())
                else setSuggestions([])
              }}
              onFocus={() => setIsFocus(true)}
              // onBlur={() => {
              //   setIsFocus(false)
              //   setActive('')
              // }}
            />
          </InputGroup>
          {isFocus && (
            <ListGroup className='suggestions'>
              <ListGroup.Item
                className='listItem'
                active={active === 'default'}
                onMouseEnter={() => setActive('default')}
                onMouseLeave={() => setActive('')}
                onClick={() => {
                  fetchData({ lat: 1.28967, lon: 103.85007, city: 'Singapore', country: 'Singapore', saveHistory: true })
                  setIsFocus(false)
                  setActive('')
                  setTextInput('')
                  setSuggestions([])
                }}
              >Use Singapore as location</ListGroup.Item>
              {suggestions.length !== 0 && suggestions.map((ele, index) => {
                return (
                  <Suggestion
                    key={index}
                    location={ele}
                    active={active}
                    setActive={setActive}
                    setIsFocus={setIsFocus}
                    setTextInput={setTextInput}
                    setSuggestions={setSuggestions}
                    fetchData={fetchData}
                  />
                )
              })}
            </ListGroup>
          )}
        </Col>
      </Row>
      
      {(info.temp === 0 && !isLoading) && <Spinner animation='border' />}
      {info.temp !== 0 && (
        <Row className='justify-content-center mx-1'>
          <Col xs={12} sm={8} className='parent'>
            <Image src={sun} alt='Image of weather' className='weatherImg' />
            <div className='desktopInfo'>
              <p className='noBottomMargin'>Today's Weather</p>
              <p className='tempText noBottomMargin'>{info.temp}&deg;</p>
              <p className='noBottomMargin'>H: {info.maxTemp}&deg; L: {info.minTemp}&deg;</p>
              <div className='d-flex justify-content-between'>
                <p className='noBottomMargin secondaryText fw-bold'>{info.city}, {info.country}</p>
                <p className='noBottomMargin secondaryText'>{info.formattedDate}</p>
                <p className='noBottomMargin secondaryText'>Humidity: {info.humidity}%</p>
                <p className='noBottomMargin secondaryText'>{info.weather}</p>
              </div>
            </div>

            <div className='mobileInfo d-flex justify-content-between'>
              <div>
                <p className='noBottomMargin'>Today's Weather</p>
                <p className='tempText noBottomMargin'>{info.temp}&deg;</p>
                <p className='noBottomMargin'>H: {info.maxTemp}&deg; L: {info.minTemp}&deg;</p>
                <p className='noBottomMargin secondaryText fw-bold'>{info.city}, {info.country}</p>
              </div>
              <div className='align-self-end text-end'>
                <p className='noBottomMargin secondaryText'>{info.weather}</p>
                <p className='noBottomMargin secondaryText'>Humidity: {info.humidity}%</p>
                <p className='noBottomMargin secondaryText'>{info.formattedDate}</p>
              </div>
            </div>

            <Row>
              <Col className='child'>
                <p className='mb-2'>Search History</p>
                <Row className='p-2'>
                  {/* {[...Array(2).keys()].map(ele => {
                    return (
                      <Record key={ele} />
                    )
                  })} */}
                  {history.length === 0 && <p>No Record</p>}
                  {history.map((ele, index) => {
                    return (
                      <Record
                        key={index}
                        record={ele}
                        fetchData={fetchData}
                        history={history}
                        setHistory={setHistory}
                      />
                    )
                  })}
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>)}

    </Container>
  )
}

export default App
