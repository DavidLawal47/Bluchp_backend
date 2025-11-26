import fs from "node:fs"

export const fetchAndSaveNews = async (url) => {
    try {
        const res = await fetch(url)
        const data = await res.json()
        console.log("2. API Response:", data)
 
        // Save data
        fs.writeFileSync("news.json", JSON.stringify(data,null,2))
        console.log("Successfully Written")
 
        // Return same data
        return data.data;
 
    } catch (error) {
        console.log("Error:", error)
        // If API fails, read from file
        const savedData = JSON.parse(fs.readFileSync("news.json"))
        return savedData
    }
 }