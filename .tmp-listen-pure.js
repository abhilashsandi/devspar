// ---- listen:start
// Listen mode: read a section's questions and answers aloud with the device's own voice (speech synthesis).
// Nothing is generated or downloaded. Code, tables and diagrams are replaced by a short spoken marker.
function speakText(html){
  let s = String(html).replace(/<!--x:extras-->[\s\S]*?<!--\/x:extras-->/g, ' ');
  s = s.replace(/<summary[\s\S]*?<\/summary>/g, ' ')
    .replace(/<details class="reveal">/g, ' The answer. ')
    .replace(/<pre[\s\S]*?<\/pre>/g, ' Code example on the card. ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' Diagram on the card. ')
    .replace(/<table[\s\S]*?<\/table>/g, ' Table on the card. ')
    .replace(/<[^>]+>/g, ' ');
  s = s.replace(/&#x([0-9a-f]+);/gi, function(m, h){ return String.fromCodePoint(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function(m, d){ return String.fromCodePoint(Number(d)); })
    .replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&rarr;/g, '→').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  s = s.replace(/\s+/g, ' ').trim();
  // two code blocks or diagrams in a row are one marker
  ['Code example on the card.', 'Diagram on the card.', 'Table on the card.'].forEach(function(m){
    const one = m.replace(/\./g, '[.]');
    s = s.replace(new RegExp('(' + one + ' ?){2,}', 'g'), m + ' ');
  });
  return s.trim();
}
// Some browsers stop a long utterance after about 15 seconds, so speak short chunks.
function speakChunks(text, max){
  max = max || 220;
  const out = [];
  let cur = '';
  const flush = function(){ if(cur){ out.push(cur); cur = ''; } };
  String(text).split(/(?<=[.!?])\s+/).filter(Boolean).forEach(function(sentence){
    while(sentence.length > max){
      let cut = Math.max(sentence.lastIndexOf(', ', max), sentence.lastIndexOf(' ', max));
      if(cut <= 0) cut = max;
      flush();
      out.push(sentence.slice(0, cut + 1).trim());
      sentence = sentence.slice(cut + 1).trim();
    }
    if(!sentence) return;
    if(cur && cur.length + 1 + sentence.length > max) flush();
    cur = cur ? cur + ' ' + sentence : sentence;
  });
  flush();
  return out;
}
// The chunks to say for one card: "Question. ..." then the 60-second script when the card has one (unless the
// full answer was asked for), otherwise the whole answer.
function speakable(q, a, full){
  const m = String(a).match(/<div data-depth="60"><p>([\s\S]*?)<\/p><\/div>/);
  const body = (!full && m) ? speakText(m[1]) : speakText(a);
  return ['Question. ' + speakText(q)].concat(speakChunks(body));
}
// ---- listen:end
