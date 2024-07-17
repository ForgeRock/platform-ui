/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const nodemailer = require('nodemailer');
const Imap = require('imap');

/**
 * Creates a test email account using the third party service https://ethereal.email
 * @returns {Object} Created account details including username, password,
 * and imap/smtp details for connecting to the accounts inbox
 */
const createEmailAccount = () => nodemailer.createTestAccount();

/**
 * Connects to the inbox of the provided account and gets the details of the
 * latest email sent mainly its email headers and body.
 * @param {Object} account the email account to connect to
 * @returns {Promise} Resolves to false if no emails are found or email
 * details if one is found
 */
const getLatestEmail = (account) => new Promise((resolve, reject) => {
  // Set connection details
  const connection = new Imap({
    user: account.user,
    password: account.pass,
    host: account.imap.host,
    port: account.imap.port,
    tls: account.imap.secure,
  });

  connection.connect();

  // Wait for connection to be ready
  connection.once('ready', () => {
    // Open its inbox in read-write mode
    connection.openBox('INBOX', false, (err, box) => {
      if (err) {
        reject(err);
      }

      // If there are no new messages, return false
      if (box.messages.total === 0) {
        resolve(false);
      } else {
        // If there are messages, get the latest one. Get its headers and body (TEXT)
        const fetch = connection.seq.fetch(`${box.messages.total}:-1`, { bodies: ['HEADER', 'TEXT'] });
        let headers = '';
        let body = '';

        // When message is received
        fetch.on('message', (msg) => {
          // it is fetched as a stream of data so parse the data and format it
          // by its type
          msg.on('body', (stream, info) => {
            stream.on('data', (chunk) => {
              const parsed = chunk.toString('utf8');
              // If the type of data is a header
              if (info.which === 'HEADER') {
                headers += parsed;
              } else {
                // if the type of data is the body
                body += parsed;
              }
            });
          });
        });

        // If there is an error connecting reject
        fetch.once('error', (error) => {
          reject(error);
        });

        // Finally
        fetch.on('end', () => {
          // If email details are empty return false
          if (!headers.length && !body.length) {
            // End the connection
            connection.end();
            resolve(false);
          } else {
            const parsedHeaders = Imap.parseHeader(headers);

            // Set the flag to delete fetched email
            connection.seq.addFlags(box.messages.total, 'Deleted', (e) => {
              if (e) {
                // End the connection
                connection.end();
                reject(e);
              } else {
                connection.expunge(() => {
                  // Get the email details
                  const emailDetails = {
                    headers: {
                      from: parsedHeaders.from[0],
                      to: parsedHeaders.to[0],
                      subject: parsedHeaders.subject[0],
                    },
                    body,
                  };

                  // End the connection
                  connection.end();

                  // Resolve with the email details
                  resolve(emailDetails);
                });
              }
            });
          }
        });
      }
    });
  });
});

module.exports = {
  createEmailAccount,
  getLatestEmail,
};
