import Layout from "../../layouts/commonLayout/Layout";
import QuestionWorkflowForm from "./QuestionWorkflowForm";

export default function QuestionsForm({ mode }) {
  return (
    <Layout
      role="admin"
      title={mode === "edit" ? "Edit Question" : "Add Question"}
    >
      <QuestionWorkflowForm mode={mode} />
    </Layout>
  );
}
