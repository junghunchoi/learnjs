
import axios from 'axios'
import cheerio from 'cheerio'

const getHtml = async () => {
  try {
    // 1
    const html = await axios.get("https://www.algumon.com/deal/rank");
    let ulList = [];
    // 2
    const $ = cheerio.load(html.data);
    // 3
    const bodyList = $("tr.list");
    bodyList.map((i, element) => {
      ulList[i] = {
        rank: i + 1,
        // 4
        title: $(element).find("td.info a.title").text().replace(/\s/g, ""),
        artist: $(element).find("td.info a.artist").text().replace(/\s/g, ""),
      };
    });
    console.log("bodyList : ", ulList);
  } catch (error) {
    console.error(error);
  }
};

getHtml();