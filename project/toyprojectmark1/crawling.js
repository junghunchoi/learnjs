const axios = require("axios")
const cheerio = require("cheerio")
const nodeMailer = require("nodemailer")

const transporter = nodeMailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'azzudi@gmail.com',
    pass: 'ocvv nimd icbp glty',
  }
});

const getHTML = async (keyword) =>{
  try {
    const html = (await axios.get(`https://www.jobkorea.co.kr/Search/?stext=${encodeURI(keyword)}`)).data;

    return html;
  } catch (e){
    console.log(e)
  }

}

const parsing = async (page) => {
  const $ = cheerio.load(page);
  const jobs = [];
  const $jobList = $(".post");
  $jobList.each((index, element) => {
    const jobTitle = $(element).find(".title:eq(0)").text().trim();
    const company = $(element).find(".name:eq(0)").text().trim();
    const experience = $(element).find(".exp:eq(0)").text().trim();
    const education = $(element).find(".edu:eq(0)").text().trim();
    const regular = $(element).find(".option > span:eq(2)").text().trim();
    const region  = $(element).find(".loc:eq(0)").text().trim();
    const dueDate = $(element).find(".date:eq(0)").text().trim();
    const etc = $(element).find(".etc:eq(0)").text().trim();

    jobs.push({
      jobTitle, company, experience, education, regular, region, dueDate, etc
    });
  });

  return jobs;
}

const getJob = async (keyword) => {
  const html = await getHTML(keyword);
  const jobs = await parsing(html);

  return jobs;
}

const crawling = async (keyword) => {
  const jobs = await getJob(keyword);

  const h = [];
  h.push(`<table style="border: 1px solid black; border-collapse: collapse;">`);
  h.push(`<thead>`);
  h.push(`<tr>`);
  h.push(`<th>구인제목</th>`);
  h.push(`<th>회사명</th>`);
  h.push(`<th>경력여부</th>`);
  h.push(`<th>학력여부</th>`);
  h.push(`<th>정규직여부</th>`);
  h.push(`<th>지역</th>`);
  h.push(`<th>마감일</th>`);
  h.push(`<th>비고</th>`);
  h.push(`<th>`);
  h.push(`</th>`);
  h.push(`</thead>`);
  h.push(`<tbody>`);
  jobs.forEach((job) => {
    h.push(`<tr>`);
    h.push(`<td>${job.jobTitle}</td>`);
    h.push(`<td>${job.company}</td>`);
    h.push(`<td>${job.experience}</td>`);
    h.push(`<td>${job.education}</td>`);
    h.push(`<td>${job.regular}</td>`);
    h.push(`<td>${job.region}</td>`);
    h.push(`<td>${job.dueDate}</td>`);
    h.push(`<td>${job.etc}</td>`);
    h.push(`</tr>`);
  });
  h.push(`</tbody>`);
  h.push(`</table>`);

  // const email ={
  //   from: "azzudi@naver.com",
  //   to: "azzui@naver.com",
  //   subject: "취업정보",
  //   html: h.join("")
  // }
  transporter.sendMail({
    from: "azzudi@naver.com",
    to: "azzudi@naver.com",
    subject: "취업정보",
    html: h.join("")
  });


}

crawling("node.js");

