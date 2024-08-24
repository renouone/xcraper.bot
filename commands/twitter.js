import axios from 'axios'
import { JSDOM } from 'jsdom'

export default (bot) => {
    bot.hears(/\/\/twitter.com.*/, async ctx => {
        try {
            const url = ctx.message.text;
            // as twitter api is no longer free and has limitation, i'll scrape nitter for the time being
            const nitterUrl = url.replace('twitter.com', 'nitter.poast.org');
            const { data } = await axios.get(nitterUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                    Host: 'nitter.poast.org'
                }
            })
            const dom = new JSDOM(data);
            const $ = (selector) => dom.window.document.querySelector(selector)
            const tweetBodyElement = $('.tweet-body');
            //
            const opName = tweetBodyElement.querySelector('.fullname').textContent;
            const opUsername = tweetBodyElement.querySelector('.username').textContent;
            const opDescription = tweetBodyElement.querySelector('.tweet-content').textContent;
            const opDate = tweetBodyElement.querySelector('.tweet-date a').getAttribute('title');
            const opMedia = [];
            const attachment = tweetBodyElement.querySelector('.attachments');
            //
            const tweetBody = {
                name: opName,
                username: opUsername,
                description: opDescription,
                media: opMedia,
                date: opDate,
                image: true
            }
            //
            if (attachment) {
                // const media = [];
                const videoEl = attachment.querySelector('video');
                const imageEl = attachment.querySelector('.image');
                //
                if (videoEl) {
                    tweetBody.type = false;
                    let vidUrl = videoEl.querySelector('source').getAttribute('src');
                    // Videos are hosted on twitter's twimg, but gifs are hosted on nitter, to make sure the url is correct, i need to chech if the url has // or not, if not add nitter's url at the begining of the URI
                    vidUrl.includes('//') ? vidUrl = vidUrl : vidUrl = 'https://nitter.poast.org' + vidUrl;
                    opMedia.push(vidUrl);
                } else if (imageEl) {
                    tweetBody.type = true;
                    const images = imageEl.querySelectorAll('a.still-image');
                    images.forEach(i => {
                        opMedia.push(i.getAttribute('href'));
                    })
                } else {
                    console.log("cant determine the type of the media, check your url again")
                }
                // opMedia.push(media)
                //

                if (tweetBody.type) {
                    await ctx.replyWithPhoto({ url: `https://nitter.poast.org${tweetBody.media[0]}` } , 
                    {
                        parse_mode: 'HTML',
                        caption:`
<b>👤 ${tweetBody.name}</b> | <a href="//twitter.com/${tweetBody.username.replace("@", "")}">${tweetBody.username}</a>

${tweetBody.description}

<i>${tweetBody.date}</i>
                        `
                    });
                } else {
                    await ctx.replyWithVideo({ url: `${tweetBody.media}`}, 
                    {
                        parse_mode: 'HTML',
                        caption: `
<b>👤 ${tweetBody.name}</b> | <a href="//twitter.com/${tweetBody.username.replace("@", "")}">${tweetBody.username}</a>

${tweetBody.description}

<i>${tweetBody.date}</i> | <a href="${url}">Go to tweet >>></a>
                        `
                    })
                }
            } else {
                ctx.reply(`
<b>👤 ${tweetBody.name}</b> | <a href="//twitter.com/${tweetBody.username.replace("@", "")}">${tweetBody.username}</a>

${tweetBody.description}

<i>${tweetBody.date}</i> | <a href="${url}">Go to tweet >>></a>
                `, {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                })
            }
        } catch (error) {
            console.log(error)
        }
    })
}
