import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { ArgumentParseType, CommandType } from "../../utils/enums";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

export default class MusicPlay extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      parent: 'music', 
      name: 'play', 
      description: '加入語音頻道', 
      extraDescription: '若加入的是舞台頻道，可以額外在後面指定 false，讓機器人只有播歌的時候會成為發言人，其他時候會自動退下', 
      aliases: ['p'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '影片', 
        description: '可以是關鍵字、Youtube 影片連結或 Youtube 播放清單連結', 
        required: true
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.None
      }, 
      permissions: {
        bot: [PermissionFlagsBits.Speak]
      }
    });
  }

  public async execute(source: Source, [keywordOrUrl]: [string]): Promise<void> {
    if (!source.client.music.has(source.guild.id)) {
      const command = source.client.commands.search(['music', 'join']) as Command<unknown>;
      await command.execute(source, [true]);
      if (!source.guild.members.me?.voice.channel) return;
    }

    if (!source.member.voice.channelId) {
      await source.defer({ ephemeral: true });
      await source.update('請先加入一個語音頻道');
      return;
    }
    if (source.member.voice.channelId !== source.guild.members.me?.voice.channelId) {
      await source.defer({ ephemeral: true });
      await source.update('你必須跟我在同一個語音頻道裡面才可以點歌');
      return;
    }

    if (!source.deferred) await source.defer();
    await source.client.music.play(source, keywordOrUrl);
  }
}