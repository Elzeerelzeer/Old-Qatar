import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not defined!');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1) {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // 16-bit

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcmBuffer.copy(buffer, 44);
  return buffer;
}

const items = [
  {
    id: 'jar',
    text: 'الجَرّة الفخارية، أو الحِب. إناء فخاري مسامي من الطين المحروق استُخدم لتبريد وحفظ مياه الشرب العذبة قديماً.',
  },
  {
    id: 'pot',
    text: 'القدر الفخاري، البِرْمَة. قدر طيني متين محكم الغطاء لإعداد الأطباق الشعبية على الفحم والجمر ببطء ونكهة فريدة.',
  },
  {
    id: 'dallah',
    text: 'الدلّة القطرية الأصيلة. دلّة القهوة العربية الأصيلة لضيافة أهل قطر لوّل، رمز الكرم والشرف في المجالس.',
  },
  {
    id: 'cardamom',
    text: 'الهيل الأخضر الفاخر. حبوب عطرية فاخرة تدق في النجر وتُضاف للقهوة العربية لمنحها النكهة القطرية الزكية.',
  },
  {
    id: 'saffron',
    text: 'الزعفران، الذهب الأحمر. أثمن التوابل التراثية العطرية، يُكرم به فنجان القهوة وتزين به أطباق الولائم.',
  },
  {
    id: 'cinnamon',
    text: 'القرفة أو الدارسين. لحاء خشب عطري نفاذ يُلف بحبال الخيش، لإعداد المشروبات الدافئة وأطيب الأطعمة.',
  },
  {
    id: 'basket',
    text: 'السلة الخوص، أو المِخْرافَة. سلة مجدولة بإتقان من سعف النخيل، لحمل الرطب وحفظ المؤونة في بيوت لوّل.',
  },
  {
    id: 'palm',
    text: 'المهفّة، مروحة الخوص. مروحة يدوية تقليدية منسوجة من خوص النخيل الملون للتبريد والتهوية في صيف قطر.',
  },
  {
    id: 'fabric',
    text: 'أقمشة الزري وثوب النشل. أقمشة حريرية مطرزة بخيوط الذهب الزري، ترتديها الأمهات والبنات في الأعياد والمناسبات.',
  },
  {
    id: 'scale',
    text: 'ميزان اللؤلؤ والتجار. ميزان نحاسي دقيق ذو كفتين لوزن حبات اللؤلؤ الطبيعي والبهارات الثمينة.',
  },
  {
    id: 'box',
    text: 'الصندوق الخشبي، المَنْدُوس. صندوق خشبي تراثي مصفح بنحاس ومسامير قبتية لحفظ الحلي والملابس الثمينة.',
  },
  {
    id: 'lantern',
    text: 'الفانوس التراثي، السِّراج. مصباح زيتي نحاسي مع زجاج واقٍ للإضاءة في أزقة الفرجان والمنازل قديماً.',
  },
  {
    id: 'falcon',
    text: 'الصقر العربي الأصيل، الحُر والشاهين. رمز العزة والشهامة في قطر والخليج، يتوج بالبرقع الجلدي المطرز لحفظ هدوئه.',
  },
  {
    id: 'glove',
    text: 'قفاز الصقّار، أو الدَّس. قفاز جلدي سميك مبطن يرتديه الصقار لحماية يده من مخالب الصقر الجارحة.',
  },
  {
    id: 'perch',
    text: 'المجثم التراثي، أو الوَكْر. قاعدة خشبية أسطوانية ذات مسند مخملي يستقر عليه الصقر في المجلس أو المخيم.',
  },
];

const outDir = path.resolve('public/sounds/narration');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(item, retries = 3) {
  const targetFile = path.join(outDir, `${item.id}.wav`);
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000) {
    console.log(`Skipping ${item.id} (already exists)`);
    return true;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`[Attempt ${attempt}] Generating speech for [${item.id}]: "${item.text.slice(0, 30)}..."`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [
          {
            parts: [
              {
                text: item.text,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error('No audio data returned');
      }

      const pcmBuffer = Buffer.from(base64Audio, 'base64');
      const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
      fs.writeFileSync(targetFile, wavBuffer);
      console.log(`Saved ${targetFile} (${wavBuffer.length} bytes)`);
      return true;
    } catch (err) {
      console.error(`Error generating ${item.id} (attempt ${attempt}):`, err.message);
      if (attempt < retries) {
        console.log(`Waiting 25 seconds before retry...`);
        await sleep(25000);
      }
    }
  }
  return false;
}

async function run() {
  console.log(`Starting narration generation for ${items.length} items...`);

  for (const item of items) {
    const targetFile = path.join(outDir, `${item.id}.wav`);
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000) {
      console.log(`Item ${item.id} already exists.`);
      continue;
    }

    await generateWithRetry(item);
    // Rate limit for free tier is 3 requests per minute (20s interval)
    console.log('Sleeping 22 seconds for rate limits...');
    await sleep(22000);
  }

  console.log('All narration generation completed!');
}

run();
