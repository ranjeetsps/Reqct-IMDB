import { useEffect, useRef, useState } from "react";
import { SetLocalStorage } from "./customhook";
import { UseKey } from "./usekey";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];
const key = "8c423b24";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState(tempMovieData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [isLoading2, setIsLoading2] = useState(false);
  const [error2, setError2] = useState("");
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);
  const [watchedMovies, setWatchedMovies] = SetLocalStorage(
    [],
    "watchedMovies"
  );

  useEffect(() => {
    if (!selectedMovie) return; // Do nothing if no movie is selected

    async function getMovieDetails() {
      try {
        setError2(""); // Clear any previous errors
        setIsLoading2(true); // Set loading to true before fetch

        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${selectedMovie}`
        );

        if (!res.ok) {
          throw new Error("Something went wrong while fetching Movie details");
        }

        const data = await res.json();
        setSelectedMovieDetails(data);
        console.log("setSelectedMovieDetails", selectedMovieDetails);

        setIsLoading2(false); // Set loading to false after fetch
      } catch (err) {
        setIsLoading2(false); // Set loading to false in case of error
        setError2(err.message); // Set error message
        console.log("-");
      }
    }
    if (selectedMovie) {
      getMovieDetails(); //
    } else {
      return;
    }
  }, [selectedMovie]);

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Something went wrong while fetching Movies");
          }
          const data = await res.json();
          console.log(data.Search, "data");

          if (!data["Search"]) {
            throw new Error("Data not found");
          }

          setMovies(data.Search);
          setIsLoading(false);
        } catch (err) {
          setError(err.message);
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setError("");
        setIsLoading(false);
        return;
      }
      fetchMovies();
      return () => controller.abort;
    },
    [query]
  );

  function handleSelectmovie(id) {
    setSelectedMovie(selectedMovie === id ? null : id); // Toggle selection
  }

  function onAddMovie(selectedMovieDetails) {
    console.log("main function setting movies wathcd");
    setWatchedMovies((watched) => [selectedMovieDetails, ...watchedMovies]); // Add the selected movie as an object
  }

  return (
    <>
      <Navbar query={query} setQuery={setQuery} movies={movies} />

      <main className="main">
        <Box>
          {isLoading && <Loader />}
          {!isLoading && error && <ErrorComponent error={error} />}

          {!isLoading && !error && (
            <MovieList
              movies={movies}
              selectedMovie={selectedMovie}
              handleSelectmovie={handleSelectmovie}
            />
          )}
        </Box>
        <Box>
          {isLoading2 && <Loader />}
          {!isLoading2 && error2 && <ErrorComponent error={error2} />}
          {!isLoading2 && !error2 && selectedMovie && (
            <MovieDetails
              selectedMovieDetails={selectedMovieDetails}
              onAddMovie={onAddMovie}
              selectedMovie={selectedMovie}
              setSelectedMovie={setSelectedMovie}
            />
          )}

          {!selectedMovie && watchedMovies.length > 0 && (
            <WatchedMovieList
              watchedMovies={watchedMovies}
              handleSelectmovie={handleSelectmovie}
            />
          )}
        </Box>
      </main>
    </>
  );
}

function Navbar({ query, setQuery, movies }) {
  const inputEl = useRef();

  // useEffect(function () {
  //   inputEl.current.focus();
  //   function callback(e) {
  //     if (document.activeElement === inputEl.current) {
  //       return;
  //     }
  //     if (e.code === "Enter") {
  //       inputEl.current.focus();
  //       setQuery("");
  //     }
  //   }
  //   document.addEventListener("keydown", callback);

  //   return () => document.removeEventListener("keydown", callback);
  // }, []);

  function onPressEnter() {
    if (document.activeElement === inputEl.current) {
      return;
    }
    inputEl.current.focus();
    setQuery("");
  }

  UseKey("Enter", onPressEnter);

  return (
    <nav className="nav-bar">
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
    </nav>
  );
}

function WatchedMovieList({ watchedMovies, handleSelectmovie }) {
  return (
    <>
      <header>
        <p className="watched-heading">Watched Movies List</p>{" "}
      </header>

      <ul className="list list-movies">
        {watchedMovies.map((movie) => {
          return (
            <li
              key={movie.imdbID}
              onClick={() => handleSelectmovie(movie.imdbID)}
            >
              <img src={movie.Poster} alt={`${movie.Title} poster`} />
              <h3>{movie.Title}</h3>
              <div>
                <p>
                  <span>🗓</span>
                  <span>{movie.Year}</span>
                  <span>⭐️ {movie.imdbRating}</span>
                  <span>⏰ {movie.Runtime}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Box({ children }) {
  return <div className="box">{children}</div>;
}

function Loader() {
  return <p className="loader"> Loading...</p>;
}

function ErrorComponent({ error }) {
  return <p className="error">{error}</p>;
}

function MovieList({ movies, handleSelectmovie }) {
  return (
    <ul className="list list-movies">
      {movies.map((movie) => {
        return (
          <li
            key={movie.imdbID}
            onClick={() => handleSelectmovie(movie.imdbID)}
          >
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
              <p>
                <span>🗓</span>
                <span>{movie.Year}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function MovieDetails({
  selectedMovieDetails,
  onAddMovie,
  selectedMovie,
  setSelectedMovie,
}) {
  function onCloseFunction() {
    setSelectedMovie(null);
  }

  UseKey("Escape", onCloseFunction);

  // Only re-run the effect when selectedMovie changes
  if (selectedMovieDetails) {
    const {
      Title: title,
      Year: year,
      Poster: poster,
      Runtime: runtime,
      imdbRating,
      Plot: plot,
      Released: released,
      Actors: actors,
      Director: director,
      Genre: genre,
    } = selectedMovieDetails;

    function handleAddMovieToList() {
      console.log("calling main add function");
      onAddMovie(selectedMovieDetails);
    }

    return (
      <div className="details">
        <header>
          <p>
            <button className="btn-back" onClick={() => setSelectedMovie(null)}>
              ⬅
            </button>
          </p>
          <img src={poster} alt="img" />
          <div className="details-overview">
            <h2> {title} </h2>
            <p>{released}</p>
            <p>{genre}</p>
            <p>
              <span>⭐️</span>
              {imdbRating} IMDB Rating
            </p>
          </div>
        </header>
        <section>
          <p>
            <em>{plot}</em>
          </p>
          <p>Starring - {actors}</p>
          <p>Birected by {director}</p>
        </section>
        <section>
          <button className="btn-add" onClick={handleAddMovieToList}>
            Add to list{" "}
          </button>
        </section>
      </div>
    );
  }
}
