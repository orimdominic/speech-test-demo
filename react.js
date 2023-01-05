import React, { useState, useEffect } from "react";

function SpeechRecognition() {
  const [finalTranscript, setFinalTranscript] = useState("");
  const [recognizing, setRecognizing] = useState(false);
  const [ignoreOnend, setIgnoreOnend] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const phrases = [    "An essay is generally a short piece of writing",    "To get started, the user clicks on the microphone button to trigger the code",    "Speech recognition results are provided to the web page as a list of hypotheses",  ];

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("This browser is does not have the features required for this test");
    } else {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true; // listen for long speech
      recognition.interimResults = true; // generate results as speech is received

      recognition.onstart = function () {
        setRecognizing(true);
      };

      recognition.onerror = function (event) {
        if (event.error === "no-speech") {
          setIgnoreOnend(true);
        }
        if (event.error === "audio-capture") {
          setIgnoreOnend(true);
        }
        if (event.error === "not-allowed") {
          if (event.timeStamp - startTimestamp < 100) {
            showInfo("info_blocked");
          } else {
            showInfo("info_denied");
          }
          setIgnoreOnend(true);
        }
      };

      recognition.onend = function () {
        setRecognizing(false);

        if (ignoreOnend) {
          return;
        }
        setCurrentPhraseIndex(currentPhraseIndex + 1);

        if (currentPhraseIndex >= phrases.length) {
          btnRecord.style.display = "none";
          pCurrentPhrase.innerHTML = `Your average score is ${
            (scores.reduce((acc, score) => acc + score) / 3) * 100
          }.

          Reload the page to try again`;
        } else {
          btnRecord.innerHTML = "Start recording";
          btnRecord.style.backgroundColor = "#398b39";
          pCurrentPhrase.innerHTML = `Phrase ${currentPhraseIndex + 1}: ${
            phrases[currentPhraseIndex]
          }`;
        }
        if (!finalTranscript) {
          // console.log("no final transcript");
          setScores((scores) => [...scores, 0]);
          return;
        }
        const score = similarity(
          phrases[currentPhraseIndex - 1]
            .toLowerCase()
            .replace(/[^\w\s']|_/g, "")
            .replace(/\s+/g, " ")
        );
        setScores((scores) => [...scores, score]);
    
        if (currentPhraseIndex >= phrases.length) {
          btnRecord.style.display = "none";
          pCurrentPhrase.innerHTML = `Your average score is ${Math.trunc(
            (scores.reduce((acc, score) => acc + score) / 3) * 100
          )}%
          Reload the page to try again`;
        }
      };
      recognition.onresult = function (event) {
        let interimTranscript = "";
        let finalResult;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalResult = event.results[i];
            setFinalTranscript((finalTranscript) => finalTranscript + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };
    }
  }, []);

  function linebreak(s) {
    return s.replace(/\n\n/g, "<p></p>").replace(/\n/g, "<br>");
  }

  function capitalize(s) {
    return s.replace(/\S/, (m) => m.toUpperCase());
  }

  function record(event) {
    if (currentPhraseIndex >= phrases.length) {
      return;
    }

    if (recognizing) {
      recognition.stop();
      return;
    }
    btnRecord.innerHTML = "Stop recording";
    btnRecord.style.backgroundColor = "tomato";
    setFinalTranscript("");
    recognition.lang = "en-US";
    recognition.start();
    setIgnoreOnend(false);
    setStartTimestamp(event.timeStamp);
  }

  function showInfo(s) {
    if (s) {
      for (let child = info.firstChild; child; child = child.nextSibling) {
        if (child.style) {
          child.style.display = child.id === s ? "inline" : "none";
        }
      }
            info.style.visibility = "visible";
    } else {
      info.style.visibility = "hidden";
    }
  }

  let currentStyle;
  function showButtons(style) {
    if (style === currentStyle) {
      return;
    }
    currentStyle = style;
    copyButton.style.display = style;
    copyInfo.style.display = "none";
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
    pCurrentPhrase.innerHTML = `Phrase ${currentPhraseIndex + 1}: ${
      phrases[currentPhraseIndex]
    }`;
    recordBtnContainer.style.display = "block";
  }
  /** See https://stackoverflow.com/a/36566052 */
  function similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (
      (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
    );
  }
  /** See https://stackoverflow.com/a/11958496 */
  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1))
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

