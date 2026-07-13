export interface MoeSite {
  id: string;
  name: string;
  url: string;
  tags: string[];
  description: string;
  rating?: string;
  status?: string;
}

export interface MoeCategory {
  id: string;
  name: string;
  notice?: string;
  sites: MoeSite[];
}

export const MOE_CATEGORIES: MoeCategory[] = [
  {
    id: 'anime_streaming',
    name: 'Anime Streaming',
    notice: 'AnimeKai has been officially moved to the Graveyard section',
    sites: [
      {
        id: 'anikoto',
        name: 'Anikoto',
        url: 'https://anikoto.ru/',
        tags: ['MULT', 'CLEAN', 'SUB/DUB'],
        description: 'Excellent high-speed anime streaming site with multiple audio tracks and clean player controls.',
        rating: '9.8'
      },
      {
        id: 'animepahe',
        name: 'animepahe',
        url: 'https://animepahe.ru/',
        tags: ['COMPACT', 'FAST', 'POPULAR'],
        description: 'Highly compressed, mobile-friendly layout specializing in lightning fast anime streaming with low bandwidth.',
        rating: '9.6'
      },
      {
        id: 'mkissa',
        name: 'MKissa',
        url: 'https://mkissa.com/',
        tags: ['CLEAN', 'NO-ADS', 'HD'],
        description: 'Modern, advertisement-free web player supporting flawless streaming across standard definitions.',
        rating: '9.5'
      },
      {
        id: 'reanime',
        name: 'Re:Anime',
        url: 'https://reanime.ru/',
        tags: ['COMMUNITY', 'SUBBED'],
        description: 'Curated library of classic and seasonal subbed anime powered by a dedicated enthusiast community.',
        rating: '9.2'
      },
      {
        id: 'miruro',
        name: 'Miruro',
        url: 'https://miruro.tv/',
        tags: ['MULT', 'MODERN', 'AUTOPLAY'],
        description: 'Cutting edge frontend design with auto-tracking features, high bitrate video players, and full UI customization.',
        rating: '9.7'
      },
      {
        id: 'anidb',
        name: 'AniDB',
        url: 'https://anidb.net/',
        tags: ['DATABASE', 'INFO', 'LINKS'],
        description: 'Comprehensive research database and index detailing global releases, staff lists, and download locations.',
        rating: '9.0'
      },
      {
        id: 'anizone',
        name: 'AniZone',
        url: 'https://anizone.net/',
        tags: ['STREAM', 'FAST'],
        description: 'Streamlined video server utilizing optimized routing for zero buffering across Asian and Western regions.',
        rating: '8.9'
      },
      {
        id: 'anineko',
        name: 'AniNeko',
        url: 'https://anineko.com/',
        tags: ['COMMUNITY', 'FORUMS'],
        description: 'Friendly discussion-based portal pairing high quality video mirrors with rich episode reviews.',
        rating: '8.8'
      },
      {
        id: 'senshi',
        name: 'Senshi',
        url: 'https://senshi.me/',
        tags: ['SUBBED', 'UNCENSORED'],
        description: 'High-fidelity raw and translated releases with minimal branding and pristine color grade options.',
        rating: '8.7'
      },
      {
        id: 'animestream',
        name: 'AnimeStream',
        url: 'https://animestream.id/',
        tags: ['FAST', 'COMPACT'],
        description: 'No-nonsense fast-loading stream portal providing direct access to the latest airings.',
        rating: '8.6'
      },
      {
        id: 'crunchyroll',
        name: 'Crunchyroll',
        url: 'https://www.crunchyroll.com/',
        tags: ['OFFICIAL', 'PREMIUM', 'LEGAL'],
        description: 'The world\'s largest official anime streaming distributor hosting thousands of legal streams.',
        rating: '9.1'
      },
      {
        id: 'kickassanime',
        name: 'KickAssAnime',
        url: 'https://kaas.to/',
        tags: ['POPULAR', 'MULT', 'DUB'],
        description: 'Legendary brand back with robust video mirrors, active comment boards, and quick-search controls.',
        rating: '9.4'
      }
    ]
  },
  {
    id: 'download',
    name: 'Download',
    notice: 'Check tag details for Direct Download (DDL) and BitTorrent options',
    sites: [
      {
        id: 'subsplease',
        name: 'SubsPlease',
        url: 'https://subsplease.org/',
        tags: ['XDCC', 'TORRENTS', '1080P'],
        description: 'Leading scene group providing consistent, high-speed, advertisement-free batch downloads and torrents.',
        rating: '9.9'
      },
      {
        id: 'tokyo_toshokan',
        name: 'Tokyo Toshokan',
        url: 'https://www.tokyotosho.info/',
        tags: ['TORRENTS', 'CLEAN', 'WIKI'],
        description: 'The definitive library index tracking all Japanese media, lossless audio files, and raw captures.',
        rating: '9.5'
      },
      {
        id: 'cdjapan',
        name: 'CDJapan',
        url: 'https://www.cdjapan.co.jp/',
        tags: ['PHYSICAL', 'CDS', 'OFFICIAL'],
        description: 'Authorized retailer offering direct physical order shipments of original Japanese Blu-rays, CDs, and merchandise.',
        rating: '9.3'
      },
      {
        id: 'seadex',
        name: 'SeaDex',
        url: 'https://seadex.fabulous.koomoo.space/',
        tags: ['RELEASES', 'ENCODE', 'INFO'],
        description: 'Exhaustive release evaluation index detailing the absolute highest-fidelity video encodes available.',
        rating: '9.7'
      },
      {
        id: 'nekobt',
        name: 'nekoBT',
        url: 'https://nekobt.org/',
        tags: ['TORRENTS', 'PRIVATE'],
        description: 'Enthusiast private BitTorrent community tracking raw BD releases, audio stems, and artbook archives.',
        rating: '9.1'
      },
      {
        id: 'anirena',
        name: 'AniRena',
        url: 'https://www.anirena.com/',
        tags: ['TORRENTS', 'TRACKER'],
        description: 'Classic open BitTorrent tracker providing continuous lists of fresh fan-made subtitled episodes.',
        rating: '9.0'
      },
      {
        id: 'tokyoinsider',
        name: 'TokyoInsider',
        url: 'https://www.tokyoinsider.com/',
        tags: ['DDL', 'ARCHIVE'],
        description: 'Prestige direct download archive active for over a decade hosting legacy files and soundtracks.',
        rating: '8.9'
      },
      {
        id: 'animeout',
        name: 'AnimeOut',
        url: 'https://www.animeout.xyz/',
        tags: ['DDL', 'LOGIN', 'COMPRESSED'],
        description: 'Specializes in high quality 10-bit mini-encodes via high-bandwidth direct web server downloads.',
        rating: '9.1'
      },
      {
        id: 'asiamediablog',
        name: 'Asia Media Blog',
        url: 'https://asiamediablog.com/',
        tags: ['RAW', 'DDL', 'OST'],
        description: 'Comprehensive music index compiling lossless Japanese CD rips, singles, and digital sound tracks.',
        rating: '9.2'
      },
      {
        id: 'mangazip',
        name: 'MangaZip',
        url: 'https://manga-zip.is/',
        tags: ['RAW', 'DDL', 'MANGA'],
        description: 'Massive raw manga tankobon download portal serving high quality scans in compressed formats.',
        rating: '9.3'
      },
      {
        id: 'dlraw',
        name: 'DLRaw',
        url: 'https://dl-raw.se/',
        tags: ['RAW', 'DDL', 'MANGA'],
        description: 'Direct high speed archive of raw scanlated volumes, weekly magazines, and light novel captures.',
        rating: '9.2'
      },
      {
        id: 'dl_raw_alt',
        name: 'DL-Raw',
        url: 'https://dl-raw.org/',
        tags: ['RAW', 'DDL', 'MANGA'],
        description: 'Alternative server hub host supplying fast premium links to original, unedited publisher tankobon.',
        rating: '9.0'
      },
      {
        id: 'animetoki',
        name: 'AnimeToki',
        url: 'https://animetoki.com/',
        tags: ['DDL', 'MULTI'],
        description: 'Clean user interface with direct storage server downloads for whole seasons and batch files.',
        rating: '8.8'
      },
      {
        id: 'kayoanime',
        name: 'KayoAnime',
        url: 'https://kayoanime.com/',
        tags: ['DDL', 'DRIVE', 'DUAL-AUDIO'],
        description: 'Legendary Google Drive-backed direct download portal serving beautifully encoded batch archives.',
        rating: '9.6'
      },
      {
        id: 'pandabackup',
        name: 'Panda Backup',
        url: 'https://pandabackup.me/',
        tags: ['DDL', 'MIRROR'],
        description: 'Resilient backup system compiling mirrors and cloud drive file lists for offline media preservation.',
        rating: '8.7'
      }
    ]
  },
  {
    id: 'manga',
    name: 'Manga',
    notice: 'Read online on high performance readers with customizable views',
    sites: [
      {
        id: 'mangadex',
        name: 'MangaDex',
        url: 'https://mangadex.org/',
        tags: ['CLEAN', 'NO-ADS', 'POPULAR'],
        description: 'The golden standard of fan-led manga curation. Completely open, ad-free, and supports dozens of languages.',
        rating: '9.9'
      },
      {
        id: 'mangapill',
        name: 'Mangapill',
        url: 'https://mangapill.com/',
        tags: ['FAST', 'COMPACT', 'MINIMAL'],
        description: 'Super lightweight interface designed for raw readability. Zero bloat, low layout latency, and very clean.',
        rating: '9.6'
      },
      {
        id: 'mangafire',
        name: 'MangaFire',
        url: 'https://mangafire.to/',
        tags: ['MODERN', 'MULT', 'COMMENTS'],
        description: 'Stunning premium interface with dynamic progress trackers, reading records, list building, and discussions.',
        rating: '9.5'
      },
      {
        id: 'mangareader',
        name: 'MangaReader',
        url: 'https://mangareader.to/',
        tags: ['POPULAR', 'FAST', 'DUB'],
        description: 'Fast, high-uptime online reader hosting both scanned archives and official publisher translations.',
        rating: '9.1'
      },
      {
        id: 'comick',
        name: 'ComicK',
        url: 'https://comick.io/',
        tags: ['MODERN', 'COMMUNITY', 'SMOOTH'],
        description: 'Highly interactive reader with perfect progressive-web-app design, comments, and chapter logs.',
        rating: '9.8'
      },
      {
        id: 'batoto',
        name: 'Batoto',
        url: 'https://bato.to/',
        tags: ['COMMUNITY', 'SHOUJO', 'FORUMS'],
        description: 'Cozy and long-running web platform beloved for its friendly community, romance indices, and custom list features.',
        rating: '9.2'
      },
      {
        id: 'dynasty_scans',
        name: 'Dynasty-Scans',
        url: 'https://dynasty-scans.com/',
        tags: ['YURI', 'SCANLATION', 'LEGACY'],
        description: 'Curated specialty index focus-hosting high-quality Yuri and slice-of-life scanlation collections.',
        rating: '9.4'
      },
      {
        id: 'mangaplus',
        name: 'MangaPlus',
        url: 'https://mangaplus.shueisha.co.jp/',
        tags: ['OFFICIAL', 'FREE', 'SHONEN_JUMP'],
        description: 'Official publisher platform from Shueisha serving the latest chapters of global hits free of charge.',
        rating: '9.3'
      }
    ]
  },
  {
    id: 'light_novels',
    name: 'Light Novels',
    notice: 'Read translations, original web novels, and tracking indexes',
    sites: [
      {
        id: 'novelupdates',
        name: 'NovelUpdates',
        url: 'https://www.novelupdates.com/',
        tags: ['TRANSLATIONS', 'DATABASE', 'TRACKING'],
        description: 'The premier aggregator mapping fan translation releases, series ratings, active groups, and chapter listings.',
        rating: '9.8'
      },
      {
        id: 'jnovelclub',
        name: 'J-Novel Club',
        url: 'https://j-novel.club/',
        tags: ['OFFICIAL', 'EBOOKS', 'SUBSCRIPTION'],
        description: 'Legal digital translation publisher allowing members to read weekly parts of upcoming light novel volumes.',
        rating: '9.2'
      },
      {
        id: 'bakatsuki',
        name: 'Baka-Tsuki',
        url: 'https://www.baka-tsuki.org/',
        tags: ['WIKI', 'LEGACY', 'COMMUNITY'],
        description: 'Historical wiki-based fan translation community preserving legacy series, raw volumes, and spin-off stories.',
        rating: '9.0'
      },
      {
        id: 'lnmtl',
        name: 'LNMTL',
        url: 'https://lnmtl.com/',
        tags: ['MTL', 'FAST', 'DICTIONARY'],
        description: 'Specialized machine-translation service for impatient readers looking to read raw, un-translated chapters.',
        rating: '8.5'
      },
      {
        id: 'ranobe',
        name: 'Ranobe',
        url: 'https://ranobe.xyz/',
        tags: ['CLEAN', 'MODERN', 'EPUB'],
        description: 'A beautiful, minimal library hosting EPUB downloads and elegant, readable mobile views.',
        rating: '9.4'
      }
    ]
  },
  {
    id: 'community',
    name: 'Community',
    notice: 'Connect with other fans, build watchlists, and research details',
    sites: [
      {
        id: 'myanimelist',
        name: 'MyAnimeList',
        url: 'https://myanimelist.net/',
        tags: ['DATABASE', 'FORUMS', 'POPULAR'],
        description: 'The world\'s most popular database, rating chart, forum system, and watchlist platform for anime and manga.',
        rating: '9.4'
      },
      {
        id: 'anilist',
        name: 'AniList',
        url: 'https://anilist.co/',
        tags: ['MODERN', 'ANALYTICS', 'CLEAN'],
        description: 'Gorgeous, highly interactive modern tracking database with powerful custom statistics and beautiful APIs.',
        rating: '9.7'
      },
      {
        id: 'kitsu',
        name: 'Kitsu',
        url: 'https://kitsu.io/',
        tags: ['SOCIAL', 'TRACKING', 'MOBILE'],
        description: 'Highly visual, mobile-first social tracking platform featuring dynamic activity feeds and community groups.',
        rating: '9.0'
      },
      {
        id: 'reddit_anime',
        name: 'Reddit /r/anime',
        url: 'https://www.reddit.com/r/anime/',
        tags: ['FORUM', 'DISCUSSION', 'NEWS'],
        description: 'The central hub for English-speaking anime fans to host weekly discussions, news alerts, and visual artwork.',
        rating: '9.2'
      },
      {
        id: 'animenewsnetwork',
        name: 'Anime News Network',
        url: 'https://www.animenewsnetwork.com/',
        tags: ['NEWS', 'REVIEWS', 'ENCYCLOPEDIA'],
        description: 'The oldest and most respected journalism outlet reporting on industry news, licenses, and global voice casts.',
        rating: '9.1'
      }
    ]
  },
  {
    id: 'torrents',
    name: 'Torrents',
    notice: 'Access high fidelity media batches and raw broadcasts',
    sites: [
      {
        id: 'nyaa',
        name: 'Nyaa.si',
        url: 'https://nyaa.si/',
        tags: ['POPULAR', 'TORRENTS', 'RELEASES'],
        description: 'The absolute king of Japanese public BitTorrent trackers, compiling fan subtitles, raws, and games.',
        rating: '9.9'
      },
      {
        id: 'anidex',
        name: 'AniDex',
        url: 'https://anidex.info/',
        tags: ['TORRENTS', 'CLEAN', 'API'],
        description: 'Clean public torrent index featuring quick category search, verified upload groups, and comprehensive APIs.',
        rating: '9.2'
      },
      {
        id: 'sharewood',
        name: 'Sharewood',
        url: 'https://www.sharewood.cc/',
        tags: ['PRIVATE', 'TORRENTS', 'RATIO'],
        description: 'Exclusive private tracker focused on preserving lossless high fidelity sound, scans, and BD backups.',
        rating: '8.9'
      }
    ]
  }
];
