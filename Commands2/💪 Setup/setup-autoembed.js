var {
  MessageEmbed
} = require(`discord.js`);
var Discord = require(`discord.js`);
var config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
var emoji = require(`${process.cwd()}/botconfig/emojis.json`);
var {
  databasing,
  edit_msg,
  send_roster
} = require(`${process.cwd()}/handlers/functions`);
const { MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js')
module.exports = {
  name: "setup-autoembed",
  category: "💪 Setup",
  aliases: ["setupautoembed", "autoembed-setup"],
  cooldown: 5,
  usage: "setup-autoembed  --> Follow the Steps",
  description: "Define a Channel where every message is replaced with an EMBED or disable this feature",
  memberpermissions: ["ADMINISTRATOR"],
  type: "system",
  run: async (client, message, args, cmduser, text, prefix) => {
    
    let es = client.settings.get(message.guild.id, "embed");let ls = client.settings.get(message.guild.id, "language")
    try {
      let NumberEmojiIds = getNumberEmojis().map(emoji => emoji?.replace(">", "").split(":")[2])
      first_layer()
      async function first_layer(){
        let menuoptions = [{
            value: "Add a Channel",
            description: `Add a auto sending Embed Setup Channel`,
            emoji: NumberEmojiIds[1]
          },
          {
            value: "Remove a Channel",
            description: `Remove a Channel from the Setup`,
            emoji: NumberEmojiIds[2]
          },
          {
            value: "Show all Channels",
            description: `Show all setup Channels!`,
            emoji: "📑"
          },
          {
            value: "Cancel",
            description: `Cancel and stop the Auto-Nsfw-Setup!`,
            emoji: "935025938859700294"
          }
        ]
        //define the selection
        let Selection = new MessageSelectMenu()
          .setCustomId('MenuSelection') 
          .setMaxValues(1) //OPTIONAL, this is how many values you can have at each selection
          .setMinValues(1) //OPTIONAL , this is how many values you need to have at each selection
          .setPlaceholder('Click me to setup the Automated Embed System!') 
          .addOptions(
          menuoptions.map(option => {
            let Obj = {
              label: option.label ? option.label.substring(0, 50) : option.value.substring(0, 50),
              value: option.value.substring(0, 50),
              description: option.description.substring(0, 50),
            }
          if(option.emoji) Obj.emoji = option.emoji;
          return Obj;
         }))
        
        //define the embed
        let MenuEmbed = new Discord.MessageEmbed()
        .setColor(es.color)
        .setAuthor('Auto Embed Setup', 'https://cdn.discordapp.com/emojis/850829013438300221.png?size=96', 'https://discord.gg/milrato')
        .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-ticket"]["variable2"]))
        let used1 = false;
        //send the menu msg
        let menumsg = await message.reply({embeds: [MenuEmbed], components: [new MessageActionRow().addComponents(Selection)]})

        //Create the collector
        const collector = menumsg.createMessageComponentCollector({ 
          filter: i => i?.isSelectMenu() && i?.message.author.id == client.user.id && i?.user,
          time: 90000
        })
        //Menu Collections
        collector.on('collect', menu => {
          if (menu?.user.id === cmduser.id) {
            collector.stop();
            let menuoptiondata = menuoptions.find(v=>v.value == menu?.values[0])
            if(menu?.values[0] == "Cancel") return menu?.reply(eval(client.la[ls]["cmds"]["setup"]["setup-ticket"]["variable3"]))
            menu?.deferUpdate();
            used1 = true;
            handle_the_picks(menu?.values[0], menuoptiondata)
          }
          else menu?.reply({content: `<:M_x:933261310588760115> You are not allowed to do that! Only: <@${cmduser.id}>`, ephemeral: true});
        });
        //Once the Collections ended edit the menu message
        collector.on('end', collected => {
          menumsg.edit({embeds: [menumsg.embeds[0].setDescription(`~~${menumsg.embeds[0].description}~~`)], components: [], content: `${collected && collected.first() && collected.first().values ? `<a:YES:932995837003460649> **Selected: \`${collected ? collected.first().values[0] : "Nothing"}\`**` : "❌ **NOTHING SELECTED - CANCELLED**" }`})
        });
      }
      async function handle_the_picks(optionhandletype, menuoptiondata) {
        switch (optionhandletype){
          case "Add a Channel": {
            let tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable5"]))
              .setColor(es.color)
              .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable6"]))
              .setFooter(client.getFooter(es))]
            })
            await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author.id,
                max: 1,
                time: 90000,
                errors: ["time"]
              })
              .then(collected => {
                var message = collected.first();
                var channel = message.mentions.channels.filter(ch=>ch.guild.id==message.guild.id).first() || message.guild.channels.cache.get(message.content.trim().split(" ")[0]);
                if (channel) {
                  try {
                    var a = client.settings.get(message.guild.id, "autoembed")
                    if(!Array.isArray(a)){
                      client.settings.set(message.guild.id, Array(a), "autoembed");
                      a = client.settings.get(message.guild.id, "autoembed")
                    }
                    if(a.includes(channel.id))
                    return message.reply({embeds: [new Discord.MessageEmbed()
                      .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable7"]))
                      .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable8"]))
                      .setColor(es.color)
                      .setFooter(client.getFooter(es))
                    ]});
                    client.settings.push(message.guild.id, channel.id, "autoembed")
                    return message.reply({embeds: [new Discord.MessageEmbed()
                      .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable9"]))
                      .setColor(es.color)
                      .setFooter(client.getFooter(es))
                    ]});
                  } catch (e) {
                    return message.reply({embeds: [new Discord.MessageEmbed()
                      .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable10"]))
                      .setColor(es.wrongcolor)
                      .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable11"]))
                      .setFooter(client.getFooter(es))
                    ]});
                  }
                } else {
                  return message.reply( "you didn't ping a valid Channel")
                }
              })
              .catch(e => {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable12"]))
                  .setColor(es.wrongcolor)
                  .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                  .setFooter(client.getFooter(es))
                ]});
              })
              
    
          }break;
          case "Remove a Channel": {
            let tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable13"]))
              .setColor(es.color)
              .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable14"]))
              .setFooter(client.getFooter(es))]
            })
            await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author.id,
                max: 1,
                time: 90000,
                errors: ["time"]
              })
              .then(collected => {
                var message = collected.first();
                var channel = message.mentions.channels.filter(ch=>ch.guild.id==message.guild.id).first() || message.guild.channels.cache.get(message.content.trim().split(" ")[0]);
                if (channel) {
                  try {
                    var a = client.settings.get(message.guild.id, "autoembed")
                    if(!Array.isArray(a)){
                      client.settings.set(message.guild.id, Array(a), "autoembed");
                      a = client.settings.get(message.guild.id, "autoembed")
                    }
                    if(!a.includes(channel.id))
                    return message.reply({embeds: [new Discord.MessageEmbed()
                      .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable15"]))
                      .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable16"]))
                      .setColor(es.color)
                      .setFooter(client.getFooter(es))
                    ]});
                    client.settings.remove(message.guild.id, channel.id, "autoembed")
                    return message.reply({embeds: [new Discord.MessageEmbed()
                      .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable17"]))
                      .setColor(es.color)
                      .setFooter(client.getFooter(es))
                    ]});
                  } catch (e) {
                    return message.reply({embeds: [new Discord.MessageEmbed()
                      .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable18"]))
                      .setColor(es.wrongcolor)
                      .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable19"]))
                      .setFooter(client.getFooter(es))
                    ]});
                  }
                } else {
                  return message.reply( "you didn't ping a valid Channel")
                }
              })
              .catch(e => {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable12"]))
                  .setColor(es.wrongcolor)
                  .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                  .setFooter(client.getFooter(es))
                ]});
              })
          }break;
          case "Show all Channels": {
            var a = client.settings.get(message.guild.id, "autoembed")
            if(!Array.isArray(a)){
              client.settings.set(message.guild.id, Array(a), "autoembed");
            }
            //remove invalid ids
            for(const id of a){
              if(!message.guild.channels.cache.get(id)){
                client.settings.remove(message.guild.id, id, "autoembed")
              }
            }
            a = client.settings.get(message.guild.id, "autoembed")

            message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable23"]))
              .setColor(es.color)
              .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable24"]))
              .setFooter(client.getFooter(es))]
            })
          }break;
        }
      }

    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor).setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-autoembed"]["variable26"]))
      ]});
    }
  },
};
function getNumberEmojis() {
  return [
    "<:Number_1:935048296286785536>",
    "<:Number_2:935048461903069204>",
    "<:Number_3:935048625392877659>",
    "<:Number_4:935048710931484703>",
    "<:Number_5:935048846474637364>",
    "<:Number_6:935048927722471516>",
    "<:Number_7:935051170899189833>",
    "<:Number_8:935051232714838046>",
    "<:Number_9:935154939716583484>",
    "<:Number_10:935155165726670868>",
    "<:Number_11:935155433826570240>",
    "<:Number_12:935155506228637716>",
    "<:Number_13:935155576005083157>",
    "<:Number_14:935155647031427132>",
    "<:Number_15:935155721379676160>",
    "<:Number_16:935155857170251776>",
    "<:Number_17:935157608359297115>",
    "<:Number_18:935157779839205406>",
    "<:Number_19:935157830955180103>",
    "<:Number_20:935157936819408966>",
    "<:Number_21:935157993643864184>",
    "<:Number_22:935158052640923698>",
    "<:Number_23:935158130688544808>",
    "<:Number_24:935158514110849024>",
    "<:Number_25:935158551117168680>"
  ]
}
/**
 * @INFO
 * Bot Coded by BEAST AMPLIFIER#1334 | https://discord.gg/milrato
 * @INFO
 * Work for Milrato Development | https://milrato.eu
 * @INFO
 * Please mention him / Milrato Development, when using this Code!
 * @INFO
 */
