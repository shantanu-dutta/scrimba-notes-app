import React from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Split from "react-split";
import { addDoc, onSnapshot, deleteDoc, setDoc } from "firebase/firestore";
import { getNoteRef, notesCollection } from "./firebase";

const LoadingState = {
  Loading: "Loading",
  Loaded: "Loaded",
  LoadError: "LoadError",
};

export default function App() {
  const [loadingState, setLoadingState] = React.useState(LoadingState.Loading);
  const [notes, setNotes] = React.useState([]);
  const [currentNoteId, setCurrentNoteId] = React.useState("");

  const currentNote =
    notes.find((note) => note.id === currentNoteId) || notes[0];

  React.useEffect(() => {
    return onSnapshot(notesCollection, (snapshot) => {
      console.log("notes updated.");
      const notesArr = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log("latest notes:", notesArr);
      setNotes(notesArr);
      setLoadingState(LoadingState.Loaded);
    });
  }, []);

  React.useEffect(() => {
    if (!currentNoteId) {
      setCurrentNoteId(notes[0]?.id);
    }
  }, [notes]);

  async function createNewNote() {
    const newNote = {
      body: "# Type your markdown note's title here",
      createAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newNoteRef = await addDoc(notesCollection, newNote);
    setCurrentNoteId(newNoteRef.id);
  }

  async function updateNote(text) {
    const noteRef = getNoteRef(currentNoteId);
    await setDoc(
      noteRef,
      { body: text, updatedAt: Date.now() },
      { merge: true }
    );
  }

  async function deleteNote(event, noteId) {
    event.stopPropagation();
    const noteRef = getNoteRef(noteId);
    await deleteDoc(noteRef);
  }

  

  return (
    <main>
      {loadingState === LoadingState.Loading ? (
        <div className="no-notes">
          <h1>Loading notes...</h1>
        </div>
      ) : loadingState === LoadingState.Loaded ? (
        notes.length > 0 ? (
          <Split sizes={[30, 70]} direction="horizontal" className="split">
            <Sidebar
              notes={notes}
              currentNote={currentNote}
              setCurrentNoteId={setCurrentNoteId}
              newNote={createNewNote}
              deleteNote={deleteNote}
            />
            <Editor currentNote={currentNote} updateNote={updateNote} />
          </Split>
        ) : (
          <div className="no-notes">
            <h1>You have no notes</h1>
            <button className="first-note" onClick={createNewNote}>
              Create one now
            </button>
          </div>
        )
      ) : (
        <div className="no-notes">
          <h1>Error fetching notes.</h1>
        </div>
      )}
    </main>
  );
}
