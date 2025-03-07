import React, { useState, useEffect } from "react";
import { Search, Volume2, ChevronRight, Book, Loader2, ArrowLeft, Play, Pause, X, Moon, Sun, Heart } from "lucide-react";

const QuranFinder = () => {
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahDetail, setSurahDetail] = useState(null);
  const [showVerses, setShowVerses] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [audioRef, setAudioRef] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [playingVerse, setPlayingVerse] = useState(null);
  const [activeQari, setActiveQari] = useState("01");
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  // Color scheme based on dark mode
  const colors = darkMode
    ? {
        primary: "bg-emerald-800",
        primaryHover: "bg-emerald-700",
        primaryText: "text-emerald-400",
        secondary: "bg-gray-800",
        secondaryHover: "bg-gray-700",
        bg: "bg-gray-900",
        cardBg: "bg-gray-800",
        textPrimary: "text-gray-100",
        textSecondary: "text-gray-300",
        textTertiary: "text-gray-400",
        border: "border-gray-700",
        highlight: "bg-emerald-900",
        arabic: "text-amber-300",
      }
    : {
        primary: "bg-emerald-600",
        primaryHover: "bg-emerald-700",
        primaryText: "text-emerald-600",
        secondary: "bg-amber-50",
        secondaryHover: "bg-amber-100",
        bg: "bg-amber-50",
        cardBg: "bg-white",
        textPrimary: "text-gray-900",
        textSecondary: "text-gray-600",
        textTertiary: "text-gray-500",
        border: "border-amber-100",
        highlight: "bg-emerald-50",
        arabic: "text-emerald-800",
      };

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("quranBookmarks");
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("quranTheme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem("quranBookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("quranTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Fetch data from API
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://equran.id/api/v2/surat");
        const data = await response.json();

        if (data.code === 200 && data.data) {
          setSurahs(data.data);
          setFilteredSurahs(data.data);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter((surah) => surah.namaLatin.toLowerCase().includes(searchTerm.toLowerCase()) || surah.arti.toLowerCase().includes(searchTerm.toLowerCase()) || surah.nomor.toString().includes(searchTerm));
      setFilteredSurahs(filtered);
    }
  }, [searchTerm, surahs]);

  // Stop any playing audio when unmounted
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
      }
    };
  }, []);

  // Fetch surah detail with ayat
  const fetchSurahDetail = async (nomor) => {
    try {
      setLoadingDetail(true);
      const response = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
      const data = await response.json();

      if (data.code === 200 && data.data) {
        setSurahDetail(data.data);
      } else {
        throw new Error("Gagal mengambil data surah");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil detail surat. Silakan coba lagi nanti.");
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle audio play for full surah
  const playAudio = (surahId, audioVersion) => {
    if (audioRef) {
      audioRef.pause();
    }

    const surah = surahs.find((s) => s.nomor === surahId);
    if (surah && surah.audioFull) {
      const audio = new Audio(surah.audioFull[audioVersion]);
      audio.play();
      setAudioRef(audio);
      setPlaying({ surahId, audioVersion });

      audio.onended = () => {
        setPlaying(null);
      };
    }
  };

  // Handle audio play for specific verse
  const playVerseAudio = (nomorAyat, audioUrl) => {
    if (audioRef) {
      audioRef.pause();
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setAudioRef(audio);
    setPlayingVerse(nomorAyat);

    audio.onended = () => {
      setPlayingVerse(null);
    };
  };

  // Stop audio
  const stopAudio = () => {
    if (audioRef) {
      audioRef.pause();
      setPlaying(null);
      setPlayingVerse(null);
    }
  };

  // Handle surah selection
  const handleSelectSurah = (surah) => {
    setSelectedSurah(surah);
    fetchSurahDetail(surah.nomor);
  };

  // Handle back to list
  const handleBackToList = () => {
    stopAudio();
    setSelectedSurah(null);
    setSurahDetail(null);
    setShowVerses(false);
  };

  // Handle back to surah detail
  const handleBackToSurahDetail = () => {
    stopAudio();
    setShowVerses(false);
  };

  // Handle showing verses
  const handleShowVerses = () => {
    setShowVerses(true);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle bookmark
  const toggleBookmark = (verseId) => {
    const surahId = selectedSurah.nomor;
    const bookmarkId = `${surahId}-${verseId}`;

    if (bookmarks.includes(bookmarkId)) {
      setBookmarks(bookmarks.filter((id) => id !== bookmarkId));
    } else {
      setBookmarks([...bookmarks, bookmarkId]);
    }
  };

  // Check if verse is bookmarked
  const isBookmarked = (verseId) => {
    const surahId = selectedSurah.nomor;
    return bookmarks.includes(`${surahId}-${verseId}`);
  };

  // Format nomor ayat to include leading zeros
  const formatAyatNumber = (number, totalAyat) => {
    const length = totalAyat.toString().length;
    return number.toString().padStart(length, "0");
  };

  // Getting qari name from version
  const getQariName = (version) => {
    const qariNames = {
      "01": "Abdullah Al-Juhany",
      "02": "Abdul Muhsin Al-Qasim",
      "03": "Abdurrahman as-Sudais",
      "04": "Ibrahim Al-Dossari",
      "05": "Misyari Rasyid Al-Afasi",
    };

    return qariNames[version] || `Qari ${version}`;
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${colors.bg}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-amber-500 blur-lg opacity-20 rounded-full"></div>
          <Loader2 className="h-16 w-16 text-emerald-600 animate-spin mb-4 relative z-10" />
        </div>
        <p className={`${colors.textSecondary} mt-6 text-lg`}>Memuat data Al-Quran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${colors.bg}`}>
        <div className="bg-red-100 p-6 rounded-lg text-red-800 max-w-md shadow-lg border border-red-200">
          <p className="font-medium text-center">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // Main app rendering
  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header with dark mode toggle */}
        <div className="flex justify-between items-center mb-6">
          <div></div> {/* Spacer */}
          <button onClick={toggleDarkMode} className={`p-3 rounded-full ${darkMode ? "bg-gray-700 text-amber-300" : "bg-amber-100 text-amber-800"}`}>
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>

        {/* List of Surahs */}
        {!selectedSurah ? (
          <>
            <div className="mb-10 text-center">
              <div className="inline-block relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-amber-500 blur-lg opacity-20 rounded-full"></div>
                <div className={`relative z-10 ${colors.textPrimary} font-arabic text-5xl mb-2`}>القرآن الكريم</div>
              </div>
              <h1 className={`text-4xl font-bold ${colors.primaryText} mb-2`}>Al-Quran Digital</h1>
              <p className={`${colors.textSecondary} text-lg mt-2 max-w-xl mx-auto`}>Baca dan dengarkan Al-Quran kapan saja, di mana saja. Dengan tampilan yang nyaman untuk tilawah harian Anda.</p>

              <div className="flex justify-center mt-4">
                <div className={`h-1 w-24 ${colors.primary} rounded-full`}></div>
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari surat berdasarkan nama atau arti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full py-4 pl-12 pr-4 ${colors.cardBg} rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 border ${colors.border} ${colors.textPrimary}`}
                />
                <Search className={`absolute left-4 top-4 ${colors.textTertiary} h-5 w-5`} />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className={`absolute right-4 top-4 ${colors.textTertiary} hover:${colors.textPrimary}`}>
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.nomor}
                  className={`${colors.cardBg} rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border ${colors.border}`}
                  onClick={() => handleSelectSurah(surah)}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${colors.secondary} rounded-full ${colors.primaryText} font-medium`}>{surah.nomor}</div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className={`font-medium text-lg ${colors.textPrimary}`}>{surah.namaLatin}</h3>
                          <p className={`text-sm ${colors.textSecondary}`}>{surah.arti}</p>
                        </div>
                        <div className={`text-right font-arabic text-2xl ${colors.arabic}`}>{surah.nama}</div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className={`text-xs ${colors.textTertiary} px-2 py-1 ${colors.secondary} rounded-full`}>
                          {surah.tempatTurun} • {surah.jumlahAyat} Ayat
                        </span>
                        <ChevronRight className={`h-5 w-5 ${colors.textTertiary}`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSurahs.length === 0 && (
              <div className={`text-center py-16 ${colors.cardBg} rounded-xl shadow-md my-8`}>
                <p className={`${colors.textSecondary} text-lg`}>Tidak ada surat yang sesuai dengan pencarian Anda.</p>
                <button onClick={() => setSearchTerm("")} className={`mt-4 px-6 py-2 ${colors.primary} text-white rounded-lg hover:${colors.primaryHover}`}>
                  Reset Pencarian
                </button>
              </div>
            )}
          </>
        ) : showVerses ? (
          /* Ayat Page */
          <div className={`${colors.cardBg} rounded-xl shadow-lg mb-8 border ${colors.border} overflow-hidden`}>
            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className={`h-10 w-10 ${colors.primaryText} animate-spin mb-4`} />
                <p className={colors.textSecondary}>Memuat ayat-ayat...</p>
              </div>
            ) : surahDetail ? (
              <>
                <div className={`sticky top-0 z-10 ${colors.cardBg} border-b ${colors.border} p-4 rounded-t-xl`}>
                  <div className="flex justify-between items-center">
                    <button onClick={handleBackToSurahDetail} className={`${colors.primaryText} flex items-center text-sm font-medium px-3 py-1 ${colors.secondary} rounded-lg`}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Kembali
                    </button>
                    <h2 className={`text-xl font-bold ${colors.primaryText}`}>{surahDetail.namaLatin}</h2>
                    <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${darkMode ? "bg-gray-700 text-amber-300" : "bg-amber-100 text-amber-800"}`}>
                      {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Qari selection */}
                  <div className="mt-4 flex items-center justify-center">
                    <div className={`flex flex-wrap justify-center gap-2 p-2 ${colors.secondary} rounded-xl`}>
                      {Object.keys(surahDetail.audioFull).map((version) => (
                        <button
                          key={version}
                          onClick={() => setActiveQari(version)}
                          className={`px-4 py-2 text-sm rounded-lg transition-all ${activeQari === version ? `${colors.primary} text-white shadow-md` : `bg-opacity-50 ${colors.textSecondary} hover:${colors.secondaryHover}`}`}
                        >
                          {getQariName(version).split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className={`${colors.highlight} p-6 rounded-xl mb-8 text-center border ${colors.border}`}>
                    <p className={`text-2xl font-arabic leading-loose ${colors.arabic}`}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                    <p className={`text-sm mt-2 ${colors.textSecondary}`}>Dengan nama Allah Yang Maha Pengasih, Maha Penyayang</p>
                  </div>

                  {surahDetail.ayat.map((ayat) => (
                    <div key={ayat.nomorAyat} className={`mb-10 pb-8 border-b ${colors.border} last:border-0`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 flex-shrink-0 ${colors.secondary} rounded-full flex items-center justify-center ${colors.primaryText} text-sm font-medium`}>{formatAyatNumber(ayat.nomorAyat, surahDetail.jumlahAyat)}</div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleBookmark(ayat.nomorAyat)} className={`p-2 rounded-full ${isBookmarked(ayat.nomorAyat) ? "bg-amber-100 text-amber-600" : `${colors.secondary} ${colors.textSecondary}`}`}>
                            <Heart className={`h-4 w-4 ${isBookmarked(ayat.nomorAyat) ? "fill-amber-600" : ""}`} />
                          </button>
                          <button
                            onClick={() => (playingVerse === ayat.nomorAyat ? stopAudio() : playVerseAudio(ayat.nomorAyat, ayat.audio[activeQari]))}
                            className={`p-2 rounded-full ${playingVerse === ayat.nomorAyat ? `${colors.primary} text-white` : `${colors.secondary} ${colors.textSecondary} hover:${colors.secondaryHover}`}`}
                          >
                            {playingVerse === ayat.nomorAyat ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className={`p-6 rounded-xl ${colors.highlight} mb-4 border ${colors.border}`}>
                        <p className={`text-right font-arabic text-2xl leading-loose ${colors.arabic}`}>{ayat.teksArab}</p>
                      </div>

                      <p className={`text-sm italic mb-3 ${colors.textTertiary}`}>{ayat.teksLatin}</p>

                      <p className={`${colors.textPrimary} leading-relaxed`}>{ayat.teksIndonesia}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <p className={colors.textSecondary}>Tidak dapat memuat detail ayat.</p>
              </div>
            )}
          </div>
        ) : (
          /* Surah Detail Page */
          <div className={`${colors.cardBg} rounded-xl shadow-lg p-6 border ${colors.border}`}>
            <div className="flex justify-between items-center mb-6">
              <button onClick={handleBackToList} className={`${colors.primaryText} flex items-center text-sm font-medium px-3 py-1 ${colors.secondary} rounded-lg`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </button>
              <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${darkMode ? "bg-gray-700 text-amber-300" : "bg-amber-100 text-amber-800"}`}>
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className={`h-10 w-10 ${colors.primaryText} animate-spin mb-4`} />
                <p className={colors.textSecondary}>Memuat detail surat...</p>
              </div>
            ) : surahDetail ? (
              <>
                <div className={`${colors.highlight} rounded-xl p-8 text-center mb-8 border ${colors.border}`}>
                  <div className="inline-block mb-4">
                    <div className={`w-20 h-20 flex items-center justify-center ${colors.secondary} rounded-full mx-auto mb-2 ${colors.primaryText} font-bold text-xl`}>{surahDetail.nomor}</div>
                  </div>
                  <h2 className={`text-3xl font-bold ${colors.primaryText} mb-1`}>{surahDetail.namaLatin}</h2>
                  <p className={`text-3xl font-arabic ${colors.arabic} my-3`}>{surahDetail.nama}</p>
                  <p className={`${colors.textSecondary} text-lg mt-1`}>{surahDetail.arti}</p>
                  <div className="flex justify-center mt-4">
                    <div className={`px-4 py-1 ${colors.secondary} rounded-full text-sm ${colors.textSecondary}`}>
                      {surahDetail.tempatTurun} • {surahDetail.jumlahAyat} Ayat
                    </div>
                  </div>
                </div>

                <div className={`${colors.secondary} rounded-xl p-6 mb-8 border ${colors.border}`}>
                  <h3 className={`font-medium ${colors.textPrimary} mb-4 text-lg`}>Tentang Surat {surahDetail.namaLatin}</h3>
                  <div className={`prose max-w-none ${colors.textSecondary}`} dangerouslySetInnerHTML={{ __html: surahDetail.deskripsi }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <button onClick={handleShowVerses} className={`flex items-center justify-center gap-3 py-4 px-6 ${colors.primary} text-white rounded-xl hover:${colors.primaryHover} transition-colors shadow-md`}>
                    <Book className="h-5 w-5" />
                    <span className="font-medium">Baca Surat</span>
                  </button>

                  <div className={`flex items-center justify-center gap-3 py-4 px-6 ${colors.secondary} ${colors.textPrimary} rounded-xl border ${colors.border}`}>
                    <div className="text-center">
                      <div className="font-bold text-2xl">{surahDetail.jumlahAyat}</div>
                      <div className={`${colors.textTertiary} text-sm`}>Jumlah Ayat</div>
                    </div>
                    <div className="h-8 w-px bg-gray-300 mx-2"></div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{surahDetail.tempatTurun}</div>
                      <div className={`${colors.textTertiary} text-sm`}>Tempat Turun</div>
                    </div>
                  </div>
                </div>

                <div className={`border-t ${colors.border} pt-6`}>
                  <h3 className={`font-medium ${colors.textPrimary} mb-4 text-lg`}>Dengarkan Murottal:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {surahDetail.audioFull &&
                      Object.entries(surahDetail.audioFull).map(([version]) => {
                        const isPlaying = playing && playing.surahId === surahDetail.nomor && playing.audioVersion === version;

                        return (
                          <button
                            key={version}
                            onClick={() => (isPlaying ? stopAudio() : playAudio(surahDetail.nomor, version))}
                            className={`flex items-center p-4 rounded-xl border ${colors.border} ${isPlaying ? `${colors.primary} text-white` : `${colors.secondary} ${colors.textPrimary} hover:${colors.secondaryHover}`} transition-colors`}
                          >
                            {isPlaying ? <Pause className="h-6 w-6 mr-3" /> : <Volume2 className="h-6 w-6 mr-3" />}
                            <div className="text-left">
                              <span className="font-medium block">{getQariName(version)}</span>
                              <span className="text-xs block mt-1 opacity-80">{isPlaying ? "Sedang diputar" : "Klik untuk mendengarkan"}</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <p className={colors.textSecondary}>Tidak dapat memuat detail surat.</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 mb-4">
          <p className={`text-sm ${colors.textTertiary}`}>Al-Quran Digital © {new Date().getFullYear()} | Data dari API eQuran.id</p>
        </div>
      </div>
    </div>
  );
};

export default QuranFinder;
