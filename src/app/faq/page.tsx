import AppLayout from "@src/components/AppLayout";
import AppMenu from "@src/components/Navbars/AppMenu";
import FaqAccordion from "@src/components/Reusables/Accordion/FaqAccordion";

const page = () => {
  return (
    <AppLayout>
      <main className="bg-white mx-auto mt-32 md:mt-36">
        <section className="flex w-full flex-col items-center pt-16 text-center max-w-[1256px] mx-auto">
          <h3 className="font-semibold text-xl sm:text-2xl slg:text-4xl tracking-tighter px-4">
            Frequently Asked Question
          </h3>
          <div className="w-full">
            <FaqAccordion />
          </div>
        </section>
      </main>
      <AppMenu />
    </AppLayout>
  );
};

export default page;
