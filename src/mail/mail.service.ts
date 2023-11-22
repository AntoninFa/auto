/**
 * Dieses Modul enthält die Klasse {@linkcode MailService}, welche für
 * das verschicken von E-Mails zuständig ist.
 */

import { Injectable } from '@nestjs/common';
import { getLogger } from '../logger/logger.js';
import { eMailConfig } from '../config/mail.js';
import { type SendMailOptions } from 'nodemailer';

/**
 * Typdefinition für das Senden einer E-Mail.
 */
export interface MailParams {
    /**
     * Betreff der E-Mail.
     */
    readonly subject: string;
    /**
     * Inhalt einer E-Mail.
     */
    readonly body: string;
}

/**
 * Diese Klasse ist zuständig für das verschicken von E-Mails
 */
@Injectable()
export class MailService {
    readonly #logger = getLogger(MailService.name);

    async writeMail({ subject, body }: MailParams) {
        if (!eMailConfig.activated) {
            this.#logger.warn('writeMail: Mail soll nicht gesendet werden');
            return;
        }
        const from = '"Max Muster" <max.muster@acme.com>';
        const to = '"Marlene Muster" <marlene.muster@acme.com>';
        const data: SendMailOptions = { from, to, subject, html: body };
        this.#logger.debug('writeMail: data=%o', data);

        try {
            const nodemailer = await import('nodemailer');
            await nodemailer
                .createTransport(eMailConfig.options)
                .sendMail(data);
        } catch (err) {
            this.#logger.warn('writeMail: Fehler %o', err);
        }
    }
}
