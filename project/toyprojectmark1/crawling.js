const axios = require("axios")
const cheerio = require("cheerio")

const getHTML = async (keyword) =>{
  try {
    return axios.get(`https://www.jobkorea.co.kr/Search/?stext=${encodeURI(keyword)}`).data;
  } catch (e){
    console.log(e)
  }

}

const parsing = async (keyword) => {
  const html = await getHTML(keyword);


}

const getJob = async (keyword) => {

}

parsing("node.js");