import axios from "axios"
import DefaultEmbed from "./default-embed.js";

const API_URL_TODAY ="https://zenquotes.io/api/today"
const API_URL_RANDOM ="https://zenquotes.io/api/random"

export interface Quote {
	content: string,
	author: string,
}

function fetchQuote(url: string) {
	return axios.get(url).then(response => {
		const quotes = response.data
		const quote: Quote = {
			content: quotes[0].q,
			author: quotes[0].a,
		}
		return quote
	});
}

export function getRandomQuote() {
	return fetchQuote(API_URL_RANDOM)
}

export function getDailyQuote() {
	return fetchQuote(API_URL_TODAY)
}

export function buildQuoteEmbed(quote: Quote) {
	const embed = new DefaultEmbed()

	embed.setTitle(quote.content)
	embed.setAuthor({ name: quote.author })

	return embed
}

// export function getEmbedOfQuote(quote: Quote) {
// 	return new Promise<EmbedBuilder>((resolve, reject) => {
// 		interface EmbedAuthor {
// 			name: string,
// 			iconURL?: string,
// 			url?: string
// 		}
// 		let embedAuthor: EmbedAuthor = {
// 			name: quote.author,
// 			iconURL: undefined,
// 			url: undefined
// 		}

// 		function end() {
// 			resolve(
// 				new DefaultEmbed()
// 					.setAuthor(embedAuthor)
// 					.setTitle(quote.content)
// 			)
// 		}

// 		wiki()
// 			.page(quote.author)
// 			.then(page => {
// 				embedAuthor.url = page.url()
// 				page.mainImage().then(image => {
// 					embedAuthor.iconURL = image
// 					end()
// 				}).catch(error => end())
// 			}).catch(error => end())
// 	})
// }