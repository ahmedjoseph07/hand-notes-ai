import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import NoteCard from "@/components/NoteCard";
import SectionHeader from "@/components/SectionHeader";
import { sampleBooks, sampleNotes } from "@/lib/constants";

const Page = () => {
  return (
    <main className="wrapper pt-[calc(var(--navbar-height)+24px)] pb-18">
      <HeroSection />

      {/* Main focus: handwritten notes */}
      <section aria-labelledby="notes-heading" className="mt-12 md:mt-16">
        <SectionHeader
          id="notes-heading"
          title="Your Notes"
          description="Handwritten pages, turned into study-ready notes."
          action={{ label: "View all notes", href: "/notes" }}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {sampleNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </section>

      {/* Book library */}
      <section id="books" aria-labelledby="books-heading" className="mt-14 scroll-mt-28 md:mt-20">
        <SectionHeader
          id="books-heading"
          title="Book Library"
          description="Books to read, discuss and learn from."
          action={{ label: "Browse all books", href: "/books" }}
        />
        <div className="library-books-grid">
          {sampleBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Page;
