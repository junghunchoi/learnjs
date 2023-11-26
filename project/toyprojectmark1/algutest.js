const axios = require("axios")
const cheerio = require("cheerio")

const getHTML = async (keyword) =>{
  try {
    return axios.get("https://www.inflearn.com/courses?s=" + encodeURI(keyword));
  } catch (e){
    console.log(e)
  }

}

const parsing = async (keyword) => {
  const html = await getHTML(keyword);

  const $ = cheerio.load(html.data);
  const $courseList = $(".course_card_item");

  let courses = [];
  $courseList.each((idx, node) => {
    const title = $(node).find(".course_title:eq(0)").text();
    const instructor = $(node).find(".instructor").text();
    const price = $(node).find(".price").text();
    const link = $(node).find(".course_card_front").attr("href");

    courses.push({
      title,
      instructor,
      price,
      link
    })
  });

  console.log(courses)
}

parsing("자바스크립트");