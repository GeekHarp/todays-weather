import '../App.css'

import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons'

export default function Record({ record, fetchData, history, setHistory }) {
    const { city, country, lat, lon, formattedDate } = record
    return (
        <Col className='record' xs={12} sm={12}>
            <div>
                <p className='noBottomMargin'>{city}, {country}</p>
                <small className='mobileInfo'>{formattedDate}</small>
            </div>
            <div className='d-flex align-items-center'>
                <small className='desktopInfo'>{formattedDate}</small>
                <Button
                    className='mx-2 whiteButtons'
                    variant='light'
                    size='sm'
                    onClick={() => {
                        fetchData({ lat, lon, city, country, saveHistory: true })
                    }}
                >
                    <FontAwesomeIcon icon={faMagnifyingGlass} color='#666666' />
                </Button>
                <Button
                    className='whiteButtons'
                    variant='light'
                    size='sm'
                    onClick={() => {
                        const filtered = history.filter(ele => ele.id !== record.id)
                        setHistory(filtered)
                        localStorage.setItem('history', JSON.stringify(filtered))
                    }}
                >
                    <FontAwesomeIcon icon={faTrash} color='#666666' />
                </Button>
            </div>
        </Col>
    )
}