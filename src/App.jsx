import { useState, useEffect } from 'react'
import { Button, message } from 'antd'
import * as XLSX from 'xlsx'
import Confetti from 'react-confetti'
import './App.css'
import pickSound from '../public/pick.mp3'
import tada from '../public/tada.mp3'
import bgpic from '../public/Picture1.png'

function App() {
  const [data, setData] = useState([])
  const [randomRow, setRandomRow] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Load Cadets.xlsx on mount
  useEffect(() => {
    fetchCadetsFile()
  }, [])

  // Fetch and parse Cadets.xlsx from public folder
  const fetchCadetsFile = async () => {
    try {
      // 1) Fetch file as ArrayBuffer
      const response = await fetch('/Cadets.xlsx') // served from /public/Cadets.xlsx
      if (!response.ok) {
        throw new Error(`Failed to fetch Cadets.xlsx: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()

      // 2) Parse with XLSX
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      if (jsonData.length === 0) {
        message.warning('No data found in Cadets.xlsx')
        return
      }

      // Ensure we have at least 5 columns for columns 2,3,4 checks
      const colKeys = Object.keys(jsonData[0])
      if (colKeys.length < 5) {
        message.warning('Not enough columns in Cadets.xlsx (need at least 5).')
        return
      }

      // 3) Filter out rows where columns 2,3,4 are empty/undefined
      const filteredData = jsonData.filter((row) => {
        return (
          row[colKeys[2]] !== undefined &&
          row[colKeys[2]] !== '' &&
          row[colKeys[3]] !== undefined &&
          row[colKeys[3]] !== '' &&
          row[colKeys[4]] !== undefined &&
          row[colKeys[4]] !== ''
        )
      })

      if (filteredData.length === 0) {
        message.warning(
          'All rows are empty in columns 2,3,4 of Cadets.xlsx.'
        )
        return
      }

      // 4) Store the filtered data in state
      setData(filteredData)
      message.success('Cadets loaded successfully')
    } catch (error) {
      console.error(error)
      message.error('Error loading Cadets.xlsx. Check console for details.')
    }
  }

  // Randomize from all rows
  const handleRandomize = () => {
    if (data.length === 0) {
      message.warning('No data available. Check Cadets.xlsx or reload the page.')
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

      // Pick a random row
      const randomIndex = Math.floor(Math.random() * data.length)
      const row = data[randomIndex]

      // Create a minimal object for display
      const keys = Object.keys(row)
      const filteredRow = {
        Column0: row[keys[2]],
        Column1: row[keys[3]],
        Column2: row[keys[4]]
      }

      setRandomRow(filteredRow)

      // Play pick sound
      const audio = new Audio(pickSound)
      audio.play()

      // Speed up next pick
      count += 1
      interval *= 0.9
      setTimeout(randomize, interval)
    }

    randomize()
  }

  return (
    <>
      {/*
        1) We embed a <style> tag here in the same file.
        2) We define a "corner-box" class that uses ::before and ::after
           to draw borders in only the top-left and bottom-right corners.
      */}
      <style>{`
        .corner-box {
          position: relative; 
          transition: all 0.3s ease-in-out;
        }
     
        .corner-box::before,
        .corner-box::after {
          content: "";
          position: absolute;
          width: 50px;       /* Adjust corner size (width) */
          height: 50px;      /* Adjust corner size (height) */
          border-style: solid;
          
        }
        .corner-box::before {
          border-color : white;
          top: 0;
          left: 0;
          border-top-width: 5px;
          border-left-width: 5px;
        }
  
        .corner-box::after {
          border-color : white;
          bottom: 0;
          right: 0;
          border-bottom-width: 5px;
          border-right-width: 5px;
        }

      `}</style>

      <div
        className="h-screen w-screen relative flex gap-2 items-center justify-start bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${bgpic})` }}
      >
        {showConfetti && (
          <Confetti className="w-full !z-50 absolute top-0 left-0" />
        )}

        <div className="relative h-full bg-gray-800 p-[80px] w-[40%] z-30 flex justify-center items-center flex-col">
          <div className="flex flex-row items-center gap-10 mb-10">
            <div className="flex justify-center gap-10">
              <img
                src="https://www.crma.ac.th/wp-content/uploads/2023/06/cropped-crma_logo.png"
                className="w-[150px]"
                alt="CRMA Logo"
              />
            </div>
            <h1 className="text-[40px] font-semibold text-gray-500 ">
              CRMA RANDOM <span className="text-red-500">CADETS</span>
            </h1>
          </div>

          {/* Display the random row */}

          <div
            className={`
                corner-box 
                flex gap-4 justify-center hover:scale-110
                text-[40px] mt-[60px] p-4 text-gray-300 rounded-2xl group
                w-full py-[100px] cursor-pointer hover:!border-red-400 group
                border-transparent   /* no standard border, corners come from pseudo-elements */
              `}
          >
            <div className="flex justify-center w-full flex-col items-center " onClick={handleRandomize}
            >

              {randomRow && (<div className='w-full flex justify-center items-center gap-5 group-hover:text-[45px] transition-all duration-200'>
                <div>{randomRow.Column0}</div>
                <div>{randomRow.Column1}</div>
                <div>{randomRow.Column2}</div>
              </div>) || (<div
                className="text-[40px] px-10 w-[80%] bg-none group-hover:text-red-400 group-hover:text-[45px] border-none py-10 text-white rounded-2xl transition-all duration-200"
              >
                Random
              </div>)}

            </div>

          </div>


          {/* Randomize Button */}

        </div>
      </div>
    </>
  )
}

export default App
