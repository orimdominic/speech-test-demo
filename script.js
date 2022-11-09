let recognition;
let final_transcript = "";
let recognizing = false;
let ignore_onend;
let start_timestamp;
// let avgScore;
const phrases = [
  "An essay is generally a short piece of writing",
  "To get started, the user clicks on the microphone button to trigger the code",
  "Speech recognition results are provided to the web page as a list of hypotheses",
];
const scores = [];
let currentPhraseIndex = 0;

if (!("webkitSpeechRecognition" in window)) {
  alert("This browser is does not have the features required for this test");
} else {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true; // listen for long speech
  recognition.interimResults = true; // generate results as speech is received

  recognition.onstart = function () {
    recognizing = true;
  };

  recognition.onerror = function (event) {
    if (event.error == "no-speech") {
      ignore_onend = true;
    }
    if (event.error == "audio-capture") {
      ignore_onend = true;
    }
    if (event.error == "not-allowed") {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo("info_blocked");
      } else {
        showInfo("info_denied");
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function () {
    recognizing = false;

    if (ignore_onend) {
      return;
    }
    currentPhraseIndex++;

    if (currentPhraseIndex >= phrases.length) {
      btn_record.style.display = "none";
      p_current_phrase.innerHTML = `Your average score is ${
        (scores.reduce((acc, score) => acc + score) / 3) * 100
      }.

      Reload the page to try again`;
    } else {
      btn_record.innerHTML = "Start recording";
      btn_record.style.backgroundColor = "#398b39";
      p_current_phrase.innerHTML = `Phrase ${currentPhraseIndex + 1}: ${
        phrases[currentPhraseIndex]
      }`;
    }
    if (!final_transcript) {
      // console.log("no final transcript");
      scores.push(0);
      return;
    }
    const score = similarity(
      phrases[currentPhraseIndex - 1]
        .toLowerCase()
        .replace(/[^\w\s\']|_/g, "")
        .replace(/\s+/g, " "),
      final_transcript
        .toLowerCase()
        .replace(/[^\w\s\']|_/g, "")
        .replace(/\s+/g, " ")
    );
    scores.push(score);
    // avgScore = (scores.reduce((acc, score) => acc + score) / 3) * 100;
    // console.log({
    //   final_transcript,
    //   score,
    //   scores,
    //   average: (scores.reduce((acc, score) => acc + score) / 3) * 100,
    // });
    if (currentPhraseIndex >= phrases.length) {
      btn_record.style.display = "none";
      p_current_phrase.innerHTML = `Your average score is ${Math.trunc(
        (scores.reduce((acc, score) => acc + score) / 3) * 100
      )}%
      Reload the page to try again`;
    }
  };

  recognition.onresult = function (event) {
    let interim_transcript = "";
    let final_result;
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_result = event.results[i];
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
  };
  // recognition = new webkitSpeechRecognition();
  // recognition.continuous = true; // listen for long speech
  // recognition.interimResults = true; // generate results as speech is received

  // recognition.onstart = function () {
  //   recognizing = true;
  //   showInfo("info_speak_now");
  //   start_img.src = "mic-animate.gif";
  // };

  // recognition.onerror = function (event) {
  //   if (event.error == "no-speech") {
  //     start_img.src = "mic.gif";
  //     showInfo("info_no_speech");
  //     ignore_onend = true;
  //   }
  //   if (event.error == "audio-capture") {
  //     start_img.src = "mic.gif";
  //     showInfo("info_no_microphone");
  //     ignore_onend = true;
  //   }
  //   if (event.error == "not-allowed") {
  //     if (event.timeStamp - start_timestamp < 100) {
  //       showInfo("info_blocked");
  //     } else {
  //       showInfo("info_denied");
  //     }
  //     ignore_onend = true;
  //   }
  // };

  // recognition.onend = function () {
  //   recognizing = false;
  //   if (ignore_onend) {
  //     return;
  //   }
  //   start_img.src = "mic.gif";
  //   if (!final_transcript) {
  //     showInfo("info_start");
  //     return;
  //   }
  // showInfo("");
  // if (window.getSelection) {
  //   window.getSelection().removeAllRanges();
  //   var range = document.createRange();
  //   range.selectNode(document.getElementById("final_span"));
  //   window.getSelection().addRange(range);
  // }
  // };

  // recognition.onresult = function (event) {
  //   var interim_transcript = "";
  //   for (var i = event.resultIndex; i < event.results.length; ++i) {
  //     if (event.results[i].isFinal) {
  //       final_transcript += event.results[i][0].transcript;
  //     } else {
  //       interim_transcript += event.results[i][0].transcript;
  //     }
  //   }
  //   final_transcript = capitalize(final_transcript);
  //   final_span.innerHTML = linebreak(final_transcript);
  //   interim_span.innerHTML = linebreak(interim_transcript);
  //   if (final_transcript || interim_transcript) {
  //     showButtons("inline-block");
  //   }
  // };
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, "<p></p>").replace(one_line, "<br>");
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function (m) {
    return m.toUpperCase();
  });
}

function record(event) {
  if (currentPhraseIndex >= phrases.length) {
    return;
  }

  if (recognizing) {
    recognition.stop();
    return;
  }
  btn_record.innerHTML = "Stop recording";
  btn_record.style.backgroundColor = "tomato";
  final_transcript = "";
  recognition.lang = "en-US";
  recognition.start();
  ignore_onend = false;
  start_timestamp = event.timeStamp;
}

// function startButton(event) {
//   if (recognizing) {
//     btn_record.
//     recognition.stop();
//     return;
//   }
//   final_transcript = "";
//   recognition.lang = "en-US";
//   recognition.start();
//   ignore_onend = false;
//   final_span.innerHTML = "";
//   interim_span.innerHTML = "";
//   start_img.src = "mic-slash.gif";
//   showInfo("info_allow");
//   showButtons("none");
//   start_timestamp = event.timeStamp;
// }

function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? "inline" : "none";
      }
    }
    info.style.visibility = "visible";
  } else {
    info.style.visibility = "hidden";
  }
}

var current_style;
function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
  copy_button.style.display = style;
  copy_info.style.display = "none";
}

function startTest() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (stream) {
      console.log("You let me use your mic!");
    })
    .catch(function (err) {
      console.log("No mic for you!");
    });
  if (currentPhraseIndex >= phrases.length) {
    return;
  }
  p_current_phrase.innerHTML = `Phrase ${currentPhraseIndex + 1}: ${
    phrases[currentPhraseIndex]
  }`;
  record_btn_container.style.display = "block";
}
/** See https://stackoverflow.com/a/36566052 */
function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (
    (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
  );
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
