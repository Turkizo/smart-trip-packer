import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { TripInputForm } from './components/TripInputForm';
import { PackingListDisplay } from './components/PackingListDisplay';
import { generatePackingList, selectRelevantTemplates, refinePackingList } from './services/geminiService';
import type { PackingList, RawPackingCategory, RawPackingItem, TripHistory, TripHistoryItem } from './types';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { HistorySidebar } from './components/HistorySidebar';
import { MenuIcon } from './components/icons/MenuIcon';

type AppState = 'initial' | 'loading' | 'results' | 'error';

// The user's detailed packing lists, structured as templates for different trip types.
const USER_PACKING_TEMPLATES: Record<string, RawPackingCategory[]> = {
  "תמיד": [
    {
      category: "ציוד חיוני",
      items: [
        { name: "מזוודת ציוד שחורה" }, { name: "פקל קפה" }, { name: "צידנית גדולה" }, { name: "שישיית מים" }, { name: "אוכל (צידנית)" }, { name: "אוכל יבש (חטיפים)" }, { name: "מטען נייד" }, { name: "אולר" }, { name: "כובעים" }, { name: "רחפן" }, { name: "אלכוהול" }, { name: "בגדים להחלפה" }
      ]
    },
    {
      category: "אישי",
      items: [
        { name: "תיק שחור אישי" }, { name: "משחקים לנסיעה / ספר" }, { name: "רישיון נהיגה ונשק" }, { name: "מנטה מסטיק" }
      ]
    }
  ],
  "טיול שטח": [
    {
      category: "ציוד רכב ושטח",
      items: [
        { name: "רישיון נהיגה ונשק" }, { name: "מכשירי קשר" }, { name: "בגדי החלפה" }, { name: "מגפי בוץ" }, { name: "מפתח ספייר לרכב" }, { name: "מיכל אוויר למילוי צמיגים + אקדח" }
      ]
    }
  ],
  "מקורות מים": [
    {
      category: "ציוד מים",
      items: [
        { name: "תיק ים, מצופים, שנורקלים ומשקפות" }, { name: "בגדים להחלפה" }, { name: "מצלמה תת מימית" }, { name: "סנפירים" }
      ]
    }
  ],
  "לינה - כללי": [
    {
      category: "ציוד לינה",
      items: [
        { name: "מזוודת בגדים לילדים" }, { name: "מזוודת בגדים להורים" }, { name: "מגן מזרן לזוזו" }
      ]
    },
    {
      category: "היגיינה ורחצה",
      items: [
        { name: "תיק רחצה אילו" }, { name: "תיק רחצה כבש + מגבות" }, { name: "תיק רחצה ילדים + מגבות" }, { name: "מגבונים ונייר טואלט" }, { name: "איפור - כבש" }
      ]
    },
    {
      category: "שונות",
      items: [
        { name: "מנגל + בלון גז" }, { name: "תיק תרופות" }, { name: "מטעני חשמל" }, { name: "פנס ותאורה" }, { name: "מכונת נספרסו" }, { name: "נוהל סגירת בית" }
      ]
    }
  ],
  "לינת שטח": [
    {
      category: "ציוד קמפינג",
      items: [
        { name: "אוהל + מזרנים" }, { name: "כריות + מצעים + שמיכות" }, { name: "ציליה שחורה גדולה" }, { name: "משטחים לאש" }, { name: "שק שינה" }, { name: "מיכל מים שחור עגול" }, { name: "מאווררי כיס (ורוד ושחור)" }, { name: "מאוורר נייד עם מילוי קרח ומים" }
      ]
    },
    {
      category: "בישול שדה",
      items: [
        { name: "מנגל + בלון גז" }, { name: "סאג' + בצק" }, { name: "פויקה" }, { name: "צ'ימיגג" }, { name: "צידנית קרח קטנה" }
      ]
    },
    {
      category: "חשמל ותאורה",
      items: [
        { name: "סוללת ליתיום" }, { name: "סוללות AAA / AA" }, { name: "POWERBANKS" }
      ]
    }
  ],
  "טיסה": [
    {
      category: "הכנות לטיסה",
      items: [
        { name: "הזמנת טיסות" }, { name: "און ליין צ'קאין" }, { name: "הזמנת מלון" }, { name: "ביטוח נסיעות" }, { name: "חבילת סלולר" }, { name: "טלפונים לחירום" }, { name: "ספריית מסמכים דיגיטלית שמורה" }, { name: "שמירת מפות אופליין" }, { name: "הגדרת OOO במייל" }, { name: "Smart tag למזוודה" }
      ]
    },
    {
      category: "כסף ומסמכים",
      items: [
        { name: "כסף מזומן" }
      ]
    }
  ],
  "יאכטה": [
    {
      category: "ציוד ליאכטה",
      items: [
        { name: "מקינטה + מקציף + קפה" }, { name: "מקציף חשמלי לחלב" }, { name: "ממיר מתח 12V ל-220V" }, { name: "כבל AUX" }, { name: "רישיון יאכטה" }, { name: "נעלי מים" }, { name: "סנדלים" }, { name: "מחזיקי סמארטפון להגה" }, { name: "וסת גז וצנרת" }, { name: "קונקטורים לצינור מים" }, { name: "ערסל פירות וירקות" }
      ]
    },
    {
      category: "ביגוד והגנה",
      items: [
        { name: "בגדי ספורט" }, { name: "הגנות מהשמש (חולצה, כובע, משקפי שמש, קרם הגנה)" }
      ]
    },
    {
      category: "בטיחות וחירום",
      items: [
        { name: "תיק חירום" }, { name: "לדרמן / כלי רב תכליתי" }, { name: "קיט חירום - בוקסות, איזולירבנד" }, { name: "צילום הספינה בצ'ק-אין (לביטוח)" }
      ]
    },
    {
      category: "בידור ופנאי",
      items: [
        { name: "הורדת מוזיקה לאופליין" }, { name: "ציוד צלילה חופשית" }, { name: "קלפים" }, { name: "רמקול נייד" }, { name: "תאורת אווירה (גרילנדה USB)" }
      ]
    }
  ],
  "חו\"ל עם ילדים": [
    {
      category: "ציוד לילדים",
      items: [
        { name: "צמידי זיהוי לילדים" }, { name: "ערכת תיקון ואחזקה לעגלה" }, { name: "בוסטר לרכב לזוזו" }
      ]
    },
    {
      category: "הכנות וכללי",
      items: [
        { name: "אלכוהול מהדיוטי פרי" }, { name: "סימונים למזוודות ותיקים" }, { name: "הטבת טרום טיסה (לאונג')" }, { name: "כרטיסי אשראי רלוונטיים (הייטקזון)" }
      ]
    },
    {
      category: "אלקטרוניקה ובידור",
      items: [
        { name: "לפטופ" }, { name: "סרטים שהורדו מראש" }, { name: "כבלים לחיבור לטלוויזיה" }, { name: "מטען לגרמין" }
      ]
    }
  ]
};

const LOCAL_STORAGE_KEY = 'smartTripPackerHistory';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [tripHistory, setTripHistory] = useState<TripHistory>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const activeTrip = useMemo(() => {
    return tripHistory.find(trip => trip.id === activeTripId) || null;
  }, [tripHistory, activeTripId]);

  useEffect(() => {
    try {
      const savedHistoryJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedHistoryJSON) {
        const savedHistory: TripHistory = JSON.parse(savedHistoryJSON);
        if (Array.isArray(savedHistory)) {
          setTripHistory(savedHistory);
        }
      }
    } catch (err) {
      console.error("Failed to load or parse history from localStorage", err);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (tripHistory.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tripHistory));
    } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [tripHistory]);

  const handleGenerateList = useCallback(async (tripDescription: string) => {
    setAppState('loading');
    setActiveTripId(null);
    setError(null);
    try {
      setLoadingMessage('Analyzing your trip to select the right gear...');
      const templateNames = Object.keys(USER_PACKING_TEMPLATES);
      const selectedTemplateNames = await selectRelevantTemplates(tripDescription, templateNames);
      
      if (selectedTemplateNames.length === 0) {
        selectedTemplateNames.push("תמיד");
      }
      setLoadingMessage(`Using templates: ${selectedTemplateNames.join(', ')}`);

      const baseListMap = new Map<string, RawPackingItem[]>();
      selectedTemplateNames.forEach(templateName => {
        const templateCategories = USER_PACKING_TEMPLATES[templateName];
        if (templateCategories) {
          templateCategories.forEach(category => {
            const existingItems = baseListMap.get(category.category) || [];
            const existingItemNames = new Set(existingItems.map(i => i.name.toLowerCase()));
            const newItems = category.items.filter(item => !existingItemNames.has(item.name.toLowerCase()));
            baseListMap.set(category.category, [...existingItems, ...newItems]);
          });
        }
      });
      const baseList: RawPackingCategory[] = Array.from(baseListMap.entries()).map(([category, items]) => ({ category, items }));

      setLoadingMessage('Checking for any extras you might need...');
      const aiSuggestions = await generatePackingList(tripDescription, baseList);

      const mergedListMap = new Map<string, { category: string; items: RawPackingItem[] }>();
      baseList.forEach(cat => {
        const userItems = cat.items.map(item => ({ ...item, source: 'user' as const }));
        mergedListMap.set(cat.category, { category: cat.category, items: [...userItems] });
      });
      
      aiSuggestions.forEach(aiCat => {
          const existingCategory = mergedListMap.get(aiCat.category);
          if (existingCategory) {
              const existingItemNames = new Set(existingCategory.items.map(i => i.name.toLowerCase()));
              aiCat.items.forEach(aiItem => {
                  if (!existingItemNames.has(aiItem.name.toLowerCase())) {
                      existingCategory.items.push({ ...aiItem, source: 'ai' as const });
                  }
              });
          } else {
              const aiItems = aiCat.items.map(item => ({ ...item, source: 'ai' as const }));
              mergedListMap.set(aiCat.category, { category: aiCat.category, items: aiItems });
          }
      });
      
      const mergedList = Array.from(mergedListMap.values());
      const listWithState: PackingList = mergedList.map((category, categoryIndex) => ({
        ...category,
        id: `cat-${categoryIndex}-${Date.now()}`,
        items: category.items.map((item, itemIndex) => ({
          ...item,
          id: `item-${categoryIndex}-${itemIndex}-${Date.now()}`,
          packed: false,
        })),
      }));

      const newTrip: TripHistoryItem = {
        id: `trip-${Date.now()}`,
        tripDescription,
        packingList: listWithState,
        createdAt: new Date().toISOString(),
      };

      setTripHistory(prevHistory => [newTrip, ...prevHistory]);
      setActiveTripId(newTrip.id);
      setAppState('results');
    } catch (err) {
      console.error(err);
      setError('Sorry, we couldn\'t pack your list right now. The model might be busy. Please try again in a moment.');
      setAppState('error');
    }
  }, []);

  const handleRefineList = useCallback(async (refinementRequest: string) => {
      if (!activeTrip) return;
      setIsRefining(true);
      setError(null);
      try {
          const currentList = activeTrip.packingList;
          const updatedRawList = await refinePackingList(refinementRequest, currentList);

          // Create a map of old packed states to preserve them
          const oldPackedState = new Map<string, boolean>();
          currentList.forEach(category => {
              category.items.forEach(item => {
                  const key = `${category.category}|${item.name}`.toLowerCase();
                  oldPackedState.set(key, item.packed);
              });
          });

          const newListWithState: PackingList = updatedRawList.map((category, categoryIndex) => ({
              ...category,
              id: `cat-${categoryIndex}-${Date.now()}`,
              items: category.items.map((item, itemIndex) => {
                  const key = `${category.category}|${item.name}`.toLowerCase();
                  return {
                      ...item,
                      id: `item-${categoryIndex}-${itemIndex}-${Date.now()}`,
                      packed: oldPackedState.get(key) || false,
                  };
              }),
          }));

          setTripHistory(currentHistory =>
              currentHistory.map(trip =>
                  trip.id === activeTripId
                      ? { ...trip, packingList: newListWithState }
                      : trip
              )
          );
      } catch (err) {
          console.error(err);
          setError('Sorry, we couldn\'t update your list. Please try again.');
          // Optionally, show a toast or small error message near the input
      } finally {
          setIsRefining(false);
      }
  }, [activeTrip, activeTripId]);

  const handleTogglePacked = useCallback((categoryIndex: number, itemIndex: number) => {
    setTripHistory(currentHistory => {
      if (!activeTripId) return currentHistory;
      return currentHistory.map(trip => {
        if (trip.id === activeTripId) {
          const newList = JSON.parse(JSON.stringify(trip.packingList));
          newList[categoryIndex].items[itemIndex].packed = !newList[categoryIndex].items[itemIndex].packed;
          return { ...trip, packingList: newList };
        }
        return trip;
      });
    });
  }, [activeTripId]);
  
  const handleNewTrip = useCallback(() => {
    setAppState('initial');
    setActiveTripId(null);
    setError(null);
    setIsSidebarOpen(false);
  }, []);

  const handleSelectTrip = useCallback((tripId: string) => {
    setActiveTripId(tripId);
    setAppState('results');
    setError(null);
    setIsSidebarOpen(false);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return (
          <div className="text-center flex flex-col items-center justify-center h-full p-8">
            <SpinnerIcon className="w-12 h-12 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300">Building your list...</h2>
            <p className="text-slate-400">{loadingMessage}</p>
          </div>
        );
      case 'results':
        return activeTrip && (
          <PackingListDisplay 
            list={activeTrip.packingList} 
            tripDescription={activeTrip.tripDescription}
            onTogglePacked={handleTogglePacked} 
            onReset={handleNewTrip}
            onRefine={handleRefineList}
            isRefining={isRefining}
          />
        );
      case 'error':
        return (
          <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
            <h2 className="text-xl font-semibold text-red-400">An Error Occurred</h2>
            <p className="text-slate-300 mt-2 mb-4">{error}</p>
            <button
              onClick={handleNewTrip}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors"
            >
              Start New Trip
            </button>
          </div>
        );
      case 'initial':
      default:
        return (
          <div className="w-full">
            <header className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <SparklesIcon className="w-8 h-8 text-cyan-400"/>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 text-transparent bg-clip-text">
                        Smart Trip Packer
                    </h1>
                </div>
                <p className="text-lg text-slate-400">Your AI-powered packing assistant</p>
            </header>
            <TripInputForm onSubmit={handleGenerateList} isLoading={false} />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-white">
      <HistorySidebar
        history={tripHistory}
        activeTripId={activeTripId}
        onSelectTrip={handleSelectTrip}
        onNewTrip={handleNewTrip}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-y-auto relative">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-20 p-2 bg-slate-800/50 rounded-md"
          aria-label="Open history menu"
        >
          <MenuIcon className="w-6 h-6"/>
        </button>
        <div className="flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col">
                <main className="bg-slate-800/50 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-700/50 flex-grow flex flex-col">
                    <div className="p-6 md:p-8 min-h-[400px] flex-grow flex items-center justify-center">
                        {renderContent()}
                    </div>
                </main>
                 {(appState === 'initial' || appState === 'error') && (
                    <footer className="text-center mt-8 text-slate-500 text-sm">
                        <p>Powered by Gemini API</p>
                    </footer>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;