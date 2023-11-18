import ListGroup from 'react-bootstrap/ListGroup'

import '../App.css'

export default function Suggestion({ location, active, setActive, setIsFocus, setTextInput, setSuggestions, fetchData }) {
    const { name, country, lat, lon } = location
    return (
        <ListGroup.Item
            onMouseEnter={e => setActive(e.target.id)}
            onMouseLeave={() => setActive('')}
            id={location.name}
            active={location.name === active}
            className='listItem'
            onClick={() => {
                fetchData({ lat, lon, city: name, country, saveHistory: true })
                setIsFocus(false)
                setActive('')
                setTextInput('')
                setSuggestions([])
            }}
        >{location.name}, {location.country}</ListGroup.Item>
    )
}
