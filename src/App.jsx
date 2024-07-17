import { useState } from 'react'
import { Upload, Button, message, Checkbox, Space } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import Confetti from 'react-confetti'
import './App.css'
import pickSound from '../public/pick.mp3'
import tada from '../public/tada.mp3'
import bgpic from "../public/Picture1.png"

function App() {
  const [data, setData] = useState([])
  const [randomRow, setRandomRow] = useState(null)
  const [fileName, setFileName] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [yearArray] = useState([1, 2, 3, 4, 5])
  const [selectedYears, setSelectedYears] = useState([])

  const handleUpload = (file) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)
      setData(jsonData)
      message.success('File uploaded successfully')
    }
    reader.readAsArrayBuffer(file)
    return false
  }

  const handleRandomize = () => {
    if (data.length > 0 && selectedYears.length > 0) {
      const filteredData = data.filter(row => selectedYears.includes(row[Object.keys(row)[2]]))

      if (filteredData.length === 0) {
        message.warning('No data found for the selected years')
        return
      }

      let count = 0
      let interval = 300

      const randomize = () => {
        if (count >= 20) {
          setShowConfetti(true)
          const audio = new Audio(tada)
          audio.play()
          setTimeout(() => setShowConfetti(false), 3000) // Hide confetti after 3 seconds
  
          return
        }

        const randomIndex = Math.floor(Math.random() * filteredData.length)
        const row = filteredData[randomIndex]
        const filteredRow = {
          Column0: row[Object.keys(row)[1]],
          Column1: row[Object.keys(row)[2]],
          Column2: row[Object.keys(row)[3]]  
        }
        setRandomRow(filteredRow)

        // Play sound
        const audio = new Audio(pickSound)
        audio.play()

        count += 1
        interval = interval * 0.9 // Speed up the interval

        setTimeout(randomize, interval)
      }

      randomize()
    } else {
      message.warning('Please upload a file and select at least one year first')
    }
  }

  const handleYearChange = (checkedValues) => {
    setSelectedYears(checkedValues)
  }

  const uploadProps = {
    beforeUpload: handleUpload,
    accept: '.xlsx',
    showUploadList: false
  }

  return (
    <div className='h-screen w-screen relative flex items-center justify-center bg-cover bg-center' style={{ backgroundImage: `url(${bgpic})` }}>
      {showConfetti && <Confetti />}
      <div className='relative border-2 rounded-2xl border-gray-300 bg-white p-5 w-[60%] z-30'>
        <div>
          <div className='flex justify-center'>
            <img style={{ height: '300px' }} src='https://www.crma.ac.th/wp-content/uploads/2023/06/cropped-crma_logo.png' className="logo" alt="Vite logo" />
          </div>
          <h1 className='text-3xl font-semibold text-gray-500'>CRMA RANDOM CADETS</h1>
        </div>
        <div className='mt-3 flex gap-2 justify-center items-center'>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload .xlsx File</Button>
          </Upload>
          {fileName && (
            <p className='text-md text-gray-600'>Uploaded file: {fileName}</p>
          )}
        </div>
        
        {randomRow && (
          <div className="random-row flex gap-2 justify-center text-[30px] mt-4 p-4 border rounded-md bg-gray-100">
            <div>{randomRow.Column0}</div>
            <div>ชั้นปีที่ {randomRow.Column1}</div>
          </div>
        )}
        <div className='flex gap-2 justify-center items-center mt-3'>
          <Space>
            <Checkbox.Group onChange={handleYearChange} value={selectedYears}>
              {yearArray.map((year) => (
                <Checkbox key={year} value={year}>{`ชั้นปีที่ ${year}`}</Checkbox>
              ))}
            </Checkbox.Group>
          </Space>
        </div>
        <div className="card mt-3 flex justify-center">
          <button className='text-2xl px-10 py-2 bg-red-600 text-white rounded-md' onClick={handleRandomize}>
            Start
          </button>
        </div>
      </div>
    </div>
  )
  
}

export default App
