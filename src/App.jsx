import { useState } from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import Confetti from 'react-confetti'
import './App.css'
import pickSound from '../public/pick.mp3'
import tada from '../public/tada.mp3'
import bgpic from "../public/Picture1.png"
import logo from '../public/CRMA_logo.png'
import { useRef } from 'react'
import { useEffect } from 'react'
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
    let interval = 700

    const randomize = () => {
      // After 20 picks, show confetti and stop
      if (count >= 30) {
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
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState(100); // Start large (in px)

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset to a large size (so we can shrink down if needed)
    let newFontSize = 100;
    container.style.fontSize = `${newFontSize}px`;

    // While text is overflowing, keep shrinking the font size
    while (container.scrollWidth > container.clientWidth && newFontSize > 5) {
      newFontSize -= 1;
      container.style.fontSize = `${newFontSize}px`;
    }

    // Save the final size to state, if you need it for something else
    setFontSize(newFontSize*0.7);
  }, [randomRow]);
  return (
    <div
      className="h-screen w-screen relative flex gap-2 items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgpic})` }}
    >
      {showConfetti && <Confetti style={{zIndex:9999}}  />}

      <div className="relative border-2 rounded-2xl border-gray-300 bg-white p-10 md:w-[95%] z-20">
        <div className="flex gap-2 flex-col">
          <div className="flex justify-center gap-5">
            <img
              style={{ height: '300px' }}
              src={logo}
              className="logo"
              alt="CRMA Logo"
            />
          </div>
          <h1 className="text-[5vw] font-semibold text-gray-500">
            INFBN CRMA
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
 <div
 ref={containerRef}
 className="random-row flex gap-2 justify-center mt-4 p-4 border rounded-md bg-gray-100 w-full text-black"
 style={{
   whiteSpace: 'nowrap',        // Keep text on one line
   overflow: 'hidden',          // Hide overflow
   textOverflow: 'ellipsis',    // Optional: Ellipsis if overflows
   fontSize: `${fontSize}px`,   // Dynamically controlled
 }}
>
 {Object.values(randomRow).join(' ')}
</div>
 
     
      
        )}

        {/* Randomize Button */}
        <div className="card mt-3 flex justify-center">
          <button
            className="flex justify-center items-center px-10 py-2 bg-red-600 text-white rounded-md h-[10vw] w-[20vw] text-[4vw] text-center"
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
