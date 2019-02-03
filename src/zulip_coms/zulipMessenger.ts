/**
 * This module is responsible for sending messages to end user
 * sent from our server --> bot/zulip server
 */

import * as zulip from 'zulip-js';
import { IZulipConfig } from './interface';

export async function initZulipMessenger(
  zulipConfig: IZulipConfig = {}
): Promise<any> {
  const config = {
    username: zulipConfig.ZULIP_USERNAME || process.env.ZULIP_USERNAME,
    apiKey: zulipConfig.ZULIP_API_KEY || process.env.ZULIP_API_KEY,
    realm: zulipConfig.ZULIP_REALM || process.env.ZULIP_REALM
  };

  const zulipAPI = await zulip(config);

  // Send a message to a given Zulip user
  function sendMessage(toEmail: string, messageContent: string);
  function sendMessage(toEmail: string[], messageContent: string);
  function sendMessage(
    toEmail: string | string[],
    messageContent: string
  ): Promise<any> {
    const emails = toEmail instanceof Array ? toEmail.join(', ') : toEmail;

    return zulipAPI.messages.send({
      to: emails,
      type: 'private',
      content: messageContent
    });
  }

  return {
    sendMessage
  };
}
