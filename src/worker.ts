  import { Worker } from '@temporalio/worker';
  import * as activities from './activities';
  import 'dotenv/config';
  import { deliveryMonitoringWorkflow } from './workflows/deliveryMonitoringWorkflow';

  async function run() {
    const worker = await Worker.create({
      workflowsPath: require.resolve('./workflows/index'),
      activities,
      taskQueue: 'delivery-monitoring',
    });

    await worker.run();
  }

  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });