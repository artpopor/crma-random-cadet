import { useState } from 'react'
import { Upload, Button, message } from 'antd'
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

  // Handle file upload
  const handleUpload = (file) => {
    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (e) => {
      const rawData = new Uint8Array(e.target.result)
      const workbook = XLSX.read(rawData, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      if (jsonData.length === 0) {
        message.warning('No data found in the file.')
        return
      }

      // Filter out rows that are entirely empty (all values are '' or undefined).
      const filteredData = jsonData.filter((row) => {
        return Object.values(row).some(
          (val) => val !== undefined && val !== ''
        )
      })

      if (filteredData.length === 0) {
        message.warning('All rows appear empty.')
        return
      }

      setData(filteredData)
      message.success('File uploaded successfully')
    }

    reader.readAsArrayBuffer(file)
    return false
  }

  // Randomize from all rows
  const handleRandomize = () => {
    if (data.length === 0) {
      message.warning('Please upload a file first')
      return
    }

    let count = 0
    let interval = 300

    const randomize = () => {
      // After 20 picks, show confetti and stop
      if (count >= 20) {
        setShowConfetti(true)
        const audio = new Audio(tada)
        audio.play()
        setTimeout(() => setShowConfetti(false), 3000) // Hide confetti after 3 seconds
        return
      }

      // Pick a random row from the entire data
      const randomIndex = Math.floor(Math.random() * data.length)
      const row = data[randomIndex]

      setRandomRow(row)

      // Play a quick "pick" sound on each iteration
      const audio = new Audio(pickSound)
      audio.play()

      count += 1
      interval *= 0.9 // Speed up the interval
      setTimeout(randomize, interval)
    }

    randomize()
  }

  // Props for Ant Design Upload
  const uploadProps = {
    beforeUpload: handleUpload,
    accept: '.xlsx',
    showUploadList: false
  }

  return (
    <div
      className="h-screen w-screen relative flex gap-2 items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgpic})` }}
    >
      {showConfetti && <Confetti />}

      <div className="relative border-2 rounded-2xl border-gray-300 bg-white p-10 w-[60%] z-30">
        <div className="flex gap-2 flex-col">
          <div className="flex justify-center gap-5">
            <img
              style={{ height: '300px' }}
              src="https://www.crma.ac.th/wp-content/uploads/2023/06/cropped-crma_logo.png"
              className="logo"
              alt="CRMA Logo"
            />
          </div>
          <h1 className="text-3xl font-semibold text-gray-500">
            CRMA RANDOM CADETS
          </h1>
        </div>

        {/* Upload Button */}
        <div className="mt-3 flex gap-2 justify-center items-center">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload .xlsx File</Button>
          </Upload>
          {fileName && (
            <p className="text-md text-gray-600">Uploaded file: {fileName}</p>
          )}
        </div>

        {/* Display the random row (all columns joined) */}
        {randomRow && (
          <div className="random-row flex gap-2 justify-center text-[30px] mt-4 p-4 border rounded-md bg-gray-100">
            {Object.values(randomRow).join(' ')}
          </div>
        )}

        {/* Randomize Button */}
        <div className="card mt-3 flex justify-center">
          <button
            className="text-2xl px-10 py-2 bg-red-600 text-white rounded-md"
            onClick={handleRandomize}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
