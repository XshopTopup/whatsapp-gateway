require('./config');
require('dotenv').config();
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
const fs = require('fs');
const util = require('util');
const chalk = require('chalk');
const axios = require('axios');
const FormData = require('form-data');
const fetch = require('node-fetch');
const ms = require('ms')
const { Digiflazz } = require('virtualapi');
const koneksiDF = new Digiflazz(
    process.env.DIGIFLAZZ_USERNAME,
    process.env.DIGIFLAZZ_PRODUCTION_KEY
);
const Chance = require('chance');
const chance = new Chance();
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta').locale('id');
const {
    rp,
    getBuffer,
    ubahNoHp,
    getGroupAdmins,
    kodeUnik,
    formatDate,
    telegraPh,
} = require('./lib/umum');
const _sewa = require("./lib/sewa");
let sewa = JSON.parse(fs.readFileSync('./database/sewa.json'));
const {
    tambahkanSaldo,
    kurangkanSaldo,
    cekSaldo,
    tambahRiwayatDepo,
    updateRiwayatDeposit,
    tambahRiwayatTopup,
    updateRiwayatTopupGagal,
    readDbRiwayatDeposit,
    readDbRiwayatTopup,
    cekTrxDF,
    cekTrxBX,
    cekTrxLq,
    adaResponList,
    readDbList,
    cekResponList,
    kirimResponList,
    tambahResponList,
    adaResponListGroup,
    hapusResponList,
    updateResponList,
} = require('./lib/rahasia');

module.exports = vbot = async (vbot, m) => {
    try {
        const body =
            m.mtype === 'conversation'
                ? m.message.conversation
                : m.mtype == 'imageMessage'
                    ? m.message.imageMessage.caption
                    : m.mtype == 'videoMessage'
                        ? m.message.videoMessage.caption
                        : m.mtype == 'extendedTextMessage'
                            ? m.message.extendedTextMessage.text
                            : m.mtype == 'buttonsResponseMessage'
                                ? m.message.buttonsResponseMessage.selectedButtonId
                                : m.mtype == 'listResponseMessage'
                                    ? m.message.listResponseMessage.singleSelectReply.selectedRowId
                                    : m.mtype == 'templateButtonReplyMessage'
                                        ? m.message.templateButtonReplyMessage.selectedId
                                        : m.mtype === 'messageContextInfo'
                                            ? m.message.buttonsResponseMessage?.selectedButtonId ||
                                            m.message.listResponseMessage?.singleSelectReply
                                                .selectedRowId ||
                                            m.text
                                            : '';
        const budy = typeof m.text == 'string' ? m.text : '';
        const prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(body)
            ? body.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi)
            : prefa;
        const isCmd = body.startsWith(prefix);
        const command = body
            .replace(prefix, '')
            .trim()
            .split(/ +/)
            .shift()
            .toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || 'No Name';
        const botNumber = await vbot.decodeJid(vbot.user.id);
        const isCreator = [botNumber, ...pemilik]
            .map((v) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            .includes(m.sender);
        const text = (q = args.join(' '));
        const from = m.chat;
        const sender = m.sender;
        const isGroup = m.isGroup;
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const isMedia = /image|video|sticker|audio/.test(mime);
        const groupMetadata = isGroup
            ? await vbot.groupMetadata(from).catch((e) => { })
            : '';
        const groupName = isGroup ? groupMetadata.subject : '';
        const participants = isGroup ? await groupMetadata.participants : '';
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false;

        if (m.message) {
            vbot.readMessages([m.key]);
            console.log(
                '\n' +
                chalk.bold.red(
                    '[ ' +
                    chalk.bold.yellow(
                        moment(m.messageTimestamp * 1000).format(
                            'DD/MM/YYYY HH:mm:ss z'
                        )
                    ) +
                    ' ]'
                ) +
                '\n' +
                chalk.bold.cyan(`${tanda} Pesan`),
                chalk.bold.green(budy || m.mtype) +
                '\n' +
                chalk.bold.cyan(`${tanda} Dari`),
                chalk.bold.green(pushname),
                chalk.bold.yellow(sender) +
                '\n' +
                chalk.bold.cyan(`${tanda} Di`),
                chalk.bold.green(groupName),
                chalk.bold.yellow(from)
            );
        }

        _sewa.expiredCheck(vbot, sewa)
        //LAINNYA
        if (adaResponList(isGroup ? from : botNumber, body)) {
            const get_data_respon = cekResponList(
                isGroup ? from : botNumber,
                body
            );
            if (get_data_respon.image === false) {
                await vbot.sendMessage(
                    from,
                    {
                        text: kirimResponList(isGroup ? from : botNumber, body),
                    },
                    {
                        quoted: m,
                    }
                );
            } else {
                await vbot.sendMessage(
                    from,
                    {
                        image: { url: get_data_respon.imageUrl },
                        caption: get_data_respon.isiCommand,
                    },
                    { quoted: m }
                );
            }
        }

        const mentionUser = [
            ...new Set([
                ...(m.mentionedJid || []),
                ...(m.quoted ? [m.quoted.sender] : []),
            ]),
        ];

        const catatanWaktu = `_Terimakasih, Silahkan dicek_`;

        const waktu = `${moment(m.messageTimestamp * 1000).format(
            'DD/MM/YYYY, HH:mm:ss z'
        )}`;

        const satuJam = new Date().getTime() + 60 * 60 * 1000; // Menambahkan 1 jam
        const batasBayar = new Date(satuJam);
        let kadaluarsaLQ = moment().add(1, 'hour').format('YYYYMMDDHHmmss'); // Mengatur waktu kedaluwarsa 1 jam dari waktu saat ini dengan format yang sesuai
        
        function getHistoryTotalPembelian(sender) {
  const db = readDbRiwayatTopup();
  let historyUser = db.filter(item => item.nomer === sender);

  if ("0" === 0) {
    return 'Tidak ada riwayat transaksi untuk nomer tersebut.';
  } else {
    let response = '';
    let totalPembelian = 0;

    for (let history of db) {
      response += ``;

      let hargaNumber = parseInt(history.harga.replace(/[^0-9]+/g, ''));
      totalPembelian += hargaNumber;
    }

    response += `${totalPembelian}`;
    return response;
  }
}


// Contoh pemanggilan fungsi dengan pengirim "6282220587991"
let pengirim = "6282220587991";
let total_pesanan = getHistoryTotalPembelian(sender);



        switch (command) {
        	
        
    
        
        


                       
            case 'ceksaldo':
                {

                    const desk = `*━━O━O━「 SISA SALDO 」━O━O━━*

${tanda} 💵 Saldo : ${rp(cekSaldo(sender))}
${tanda} 👤 Nama : *${pushname !== undefined ? pushname : 'Kakak'
}*
${tanda} 📱 Nomer : ${ubahNoHp(sender)}

${catatanWaktu}`;
                    await vbot.sendMessage(
                        from,
                        {
                            text: desk,
                        },
                        { quoted: m }
                    );
                }
                break;
        


            
            




                
                
            
            
            
            //TRANSAKSI
             case 'trx':
                {
                    
                    if (konek.DF !== 'YA') {
                        m.reply(mess.maintenance);
                    } else {
                        const sku = text.split(' ')[0];
                        const tujuan = text.split(' ')[1];
                        const refId = `TRX${nanoid()}`;
                        const listHarga = await koneksiDF.daftarHargaDF();
                        const filteredList = listHarga
                            .filter((item) => item.buyer_sku_code === sku)
                            .sort((a, b) => a.price - b.price);
                        if (filteredList.length === 0) {
                            m.reply(
                                `*Penggunaan :* ${command} SKU 12345XXXX`
                            );
                        } else {
                            const product = filteredList[0];
                            const harga =
                                product.price < 5000
                                    ? product.price + modals.markupMin
                                    : product.price +
                                      Math.ceil(product.price * modals.persen);
                            if (cekSaldo(sender) < harga) {
                                m.reply(
                                    `Perintah ini hanya bisa digunakan oleh owner bot`
                                );
                            } else {
                                const pending = ``;
                                await vbot.sendMessage(
                                    from,
                                    { text: pending },
                                    { quoted: m }
                                );
                                const hasil = await cekTrxDF(
                                    sku,
                                    tujuan,
                                    refId
                                );
                                console.log(hasil)
                                tambahRiwayatTopup(
                                    hasil.ref_id,
                                    sender,
                                    tujuan,
                                    product.product_name,
                                    rp(cekSaldo(sender)),
                                    rp(harga),
                                    rp(cekSaldo(sender) - harga),
                                    hasil.status,
                                    waktu
                                );
                                kurangkanSaldo(sender, harga);
                                const db = readDbRiwayatTopup();
                                for (const i of db) {
                                    if (refId === i.id) {
                                        if (i.status === 'Sukses') {
                                            if (
                                                i.produk.startsWith('PLN') ||
                                                i.produk.startsWith(
                                                    'Voucher Garena'
                                                )
                                            ) {
                                                const sukses = `*🟢 TRANSAKSI SUKSES*
                                                                       
 ${tanda} *Produk :* ${i.produk}
 ${tanda} *Invoice :* ${hasil.ref_id}
 ${tanda} *Date :* ${waktu}
 ${tanda} *Tujuan :* ${hasil.customer_no}
 ${tanda} *ket/SN :* Admin akan mengirimkan voucher/token

  ${catatanWaktu}`;
                                                await vbot.sendMessage(
                                                    i.nomer,
                                                    { text: hasil.sn },
                                                    { quoted: m }
                                                );
                                                await vbot.sendMessage(
                                                    from,
                                                    { text: sukses },
                                                    { quoted: m }
                                                );
                                            } else {
                                                const sukses = `*🟢 TRANSAKSI SUKSES*

 ${tanda} *Produk :* ${i.produk}
 ${tanda} *Invoice :* ${hasil.ref_id}
 ${tanda} *Date :* ${waktu}
 ${tanda} *Tujuan :* ${hasil.customer_no}
 ${tanda} *ket/SN :* ${hasil.sn}

  ${catatanWaktu}`;
                                                await vbot.sendMessage(
                                                    from,
                                                    { text: sukses },
                                                    { quoted: m }
                                                );
                                            }
                                        } else if (i.status === 'Gagal') {
                                            tambahkanSaldo(i.nomer, harga);
                                            const gagal = `*🔴 TRANSAKSI GAGAL*

${hasil.message}, silahkan pilih nominal lainnya

_Maaf, Terjadi kendala_`;
                                            updateRiwayatTopupGagal(
                                                i.id,
                                                i.nomer,
                                                i.tujuan,
                                                i.produk,
                                                i.saldo,
                                                i.harga,
                                                rp(cekSaldo(i.nomer)),
                                                hasil.status,
                                                catatanWaktu
                                            );
                                            await vbot.sendMessage(
                                                from,
                                                { text: gagal },
                                                { quoted: m }
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            
            
            
            
                case 'Topup-ml':
                {
                    
                    if (konek.DF !== 'YA') {
                        m.reply(mess.maintenance);
                    } else {
                        const saldo = await koneksiDF.cekSaldoDF();
                        const cekSaldo = parseInt(saldo.deposit);
                        const listHarga = await koneksiDF.daftarHargaDF();
                        const list = listHarga
                            .filter((item) => item.brand === 'MOBILE LEGENDS')
                            .sort((a, b) => a.price - b.price)
                            .map((i) => ({
                                nama: i.product_name,
                                harga:
                                    i.price < 5000
                                        ? i.price + modals.markupMin
                                        : i.price +
                                          Math.ceil(i.price * modals.persen),
                                sku: i.buyer_sku_code,
                                stok:
                                    !i.seller_product_status
                                        ? 'Sedang gangguan, hubungi admin'
                                        : 'Tersedia',
                            }));
                        const judul = `*🛍️「 MOBILE LEGENDS 」🛍️*

❗Harga kapan pun bisa berubah\n\n\n`;

                        const isi = list.map((item) => {
                            const status =
                                item.stok !== 'Tersedia'
                                    ? '🔴'
                                    : '🔵';
                            const harga =
                                item.stok !== 'Tersedia'
                                    ? 'Sedang gangguan, hubungi admin'
                                    : rp(item.harga);
                            return `${status} *${item.nama}*\n*💰 Harga :* ${harga}\n*🔥 Code :* ${item.sku}\n\n`;
                        });

                        const caraPembelian = `© XshopBot`;

                        const desk = judul + isi.join('') + caraPembelian;

                        const desks = [desk, 'Ketik : Cara-trx'];
                        const messages = desks.map((desk) => ({
                            text: desk,
                            mentions: [sender],
                        }));
                        for (let i = 0; i < messages.length; i++) {
                            await vbot.sendMessage(from, messages[i]);
                        }
                    }
                }
                break;
                
                
                
                
                
                                                                                                                                                                                                                                                                                                                                                             break;
                     case 'kick':
                        {
                            
                            if (!isBotAdmins) return m.reply(mess.botAdmin);
                            if (!isAdmins) return m.reply(mess.admin);
                            const users = m.mentionedJid[0]
                                ? m.mentionedJid
                                : m.quoted
                                ? [m.quoted.sender]
                                : [text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'];
                            await vbot
                                .groupParticipantsUpdate(from, users, 'remove')
                                .then((res) => {
                                    m.reply(mess.sukses);
                                })
                                .catch((error) => {
                                    vbot.sendMessage(`${pemilik}@s.whatsapp.net`, {
                                        text: `*Laporan Error :*\n\n${util.format(
                                            error
                                        )}`,
                                    });
                                });
                        }
                        break;
                }
            } catch (err) {
                await vbot.sendMessage(`${pemilik}@s.whatsapp.net`, {
                    text: `*Laporan Error :*\n\n${util.format(err)}`,
                });
            }
        };
