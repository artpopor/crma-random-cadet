import { useState } from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import './App.css'

function App() {
  const [data, setData] = useState([])
  const [randomRow, setRandomRow] = useState(null)

  const handleUpload = (file) => {
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
    if (data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length)
      setRandomRow(data[randomIndex])
    } else {
      message.warning('Please upload a file first')
    }
  }

  const uploadProps = {
    beforeUpload: handleUpload,
    accept: '.xlsx',
    showUploadList: false
  }

  return (
    <div className='h-screen justify-center flex flex-col items-center'>
      <div className='border-2 rounded-2xl border-gray-300 p-5 w-[60%]'>
      <div>
        <div className='flex justify-center'>
          <img style={{ height: '300px' }} src='https://www.crma.ac.th/wp-content/uploads/2023/06/cropped-crma_logo.png' className="logo" alt="Vite logo" />
        </div>
        <h1 className='text-3xl font-semibold text-gray-500'>CRMA RANDOM CADETS</h1>
      </div>
      <div className='mt-3'>
      <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Upload .xlsx File</Button>
        </Upload>

      </div>
      <div className="card">
        <button className='text-3xl px-4 py-2 bg-red-600 text-white rounded-md' onClick={handleRandomize}>
          Start
        </button>
      </div>
      <div>
        
      </div>
      {randomRow && (
        <div className="random-row mt-4 p-4 border rounded-md bg-gray-100">
          <h2 className='text-2xl font-semibold text-gray-700'>Random Row Data:</h2>
          <pre className='text-lg'>{JSON.stringify(randomRow, null, 2)}</pre>
        </div>
      )}
      </div>

    </div>
  )
}

export default App
