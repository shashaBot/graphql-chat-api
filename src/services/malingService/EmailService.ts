import * as sg from "@sendgrid/mail"

interface EmailContent {
  to: string,
  from: string,
  subject: string,
  html: string
}

export default class EmailService {
	private _mailer: any

	constructor() {
    this._mailer = sg
		this._mailer.setApiKey(process.env.SENDGRID_API)
  }

	async sendMail(props: EmailContent) {
		await this._mailer.send(props)
	}
}
