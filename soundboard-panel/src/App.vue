<template>
  <div
    class="select-none min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col"
  >
    <header
      class="p-4 border-b border-gray-700 flex justify-between items-center"
    >
      <h1 class="text-2xl font-bold">Soundboard</h1>
      <div class="flex gap-2">
        <button
          @click="openUploadModal"
          class="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Add Sound
        </button>
      </div>
    </header>

    <main>
      <div
        class="px-6 pt-6 flex flex-col w-full gap-2"
        v-for="category in categories"
        :key="category"
      >
        <h2 class="text-xl font-bold">{{ category }}</h2>
        <div class="flex flex-row flex-wrap gap-2.5">
          <div
            v-for="sound in sounds.filter((s) => s.category === category)"
            :key="sound.id"
            @click="playSound(sound.id)"
            @contextmenu="(e) => rightClick(e, sound)"
            class="bg-gray-800 rounded-xl px-4 py-2 shadow cursor-pointer flex flex-col justify-between group transform transition-all duration-200 hover:scale-105 hover:bg-gray-700"
          >
            <div class="text-1g font-semibold">{{ sound.title }}</div>
            <div class="text-xs text-gray-400">{{ sound.author }}</div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Bar -->
    <div
      class="flex justify-start fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-8 py-4 items-center"
    >
      <!-- Server Selector -->
      <div class="flex-1">
        <div
          class="relative inline-block w-64"
          @click="channelSelectorOpen = !channelSelectorOpen"
        >
          <!-- Dropdown toggle button -->
          <button
            class="cursor-pointer w-full flex items-center justify-between gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="selectedChannel"
                :src="selectedChannel.guildIcon"
                alt="icon"
                class="h-10 w-10 rounded-full"
              />
              <div class="flex flex-col items-start">
                <span class="font-semibold text-base">{{
                  selectedChannel?.guildName || "Use /soundboard first"
                }}</span>
                <span class="text-sm text-gray-300">{{
                  selectedChannel?.channelName || ""
                }}</span>
              </div>
            </div>
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Dropdown menu -->
          <ul
            v-if="channelSelectorOpen"
            class="w-full absolute z-20 mb-2 bg-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto bottom-full"
          >
            <li
              v-for="(channel, index) in soundboardChannels"
              :key="index"
              @click="
                selectedChannel = channel;
                channelSelectorOpen;
              "
              class="cursor-pointer flex items-center gap-3 px-4 py-2 hover:bg-gray-600"
            >
              <img
                :src="channel.guildIcon"
                alt="icon"
                class="h-8 w-8 rounded-full"
              />
              <div class="flex flex-col items-start">
                <span class="font-semibold text-sm">{{
                  channel.guildName
                }}</span>
                <span class="text-xs text-gray-300">{{
                  channel.channelName
                }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Play Button -->
      <div class="flex-1 flex justify-center">
        <svg
          @click="stopSound"
          class="cursor-pointer h-15 w-15 fill-gray-200 hover:fill-gray-300"
          viewBox="0 0 512 512"
        >
          <g>
            <path
              class="st0"
              d="M256.004,0c-141.166,0-256,114.841-256,256s114.834,256,256,256c141.151,0,255.992-114.841,255.992-256
							S397.155,0,256.004,0z M256.004,466.046C140.001,466.046,45.95,372.002,45.95,256c0-116.002,94.051-210.046,210.054-210.046
							c115.995,0,210.039,94.045,210.039,210.046C466.043,372.002,371.999,466.046,256.004,466.046z"
            />
            <rect
              x="177.23"
              y="190.36"
              class="st0"
              width="52.514"
              height="131.28"
            />
            <rect
              x="282.257"
              y="190.36"
              class="st0"
              width="52.506"
              height="131.28"
            />
          </g>
        </svg>
      </div>

      <!-- Disconnect Button -->
      <div class="flex-1 flex justify-end">
        <button
          v-if="selectedChannel"
          @click="disconnectChannel(selectedChannel)"
          class="cursor-pointer bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Disconnect
        </button>
      </div>
    </div>

    <!-- Upload/Edit Modal -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-gray-900 p-6 rounded shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">
          {{ editingSound ? "Edit Sound" : "Add Sound" }}
        </h2>
        <div class="flex flex-col gap-3">
          <input
            v-model="modalForm.title"
            placeholder="Title"
            class="p-2 rounded bg-gray-800 text-gray-100 border border-gray-700"
          />
          <input
            v-model="modalForm.author"
            placeholder="Author"
            class="p-2 rounded bg-gray-800 text-gray-100 border border-gray-700"
          />

          <!-- Category dropdown with new category option -->
          <div class="flex flex-col gap-3">
            <select
              v-model="modalForm.category"
              class="flex-1 p-2 rounded bg-gray-800 text-gray-100 border border-gray-700"
            >
              <option disabled value="">Select category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
              <option value="__new">+ New Category</option>
            </select>
            <input
              v-if="modalForm.category === '__new'"
              v-model="newCategory"
              placeholder="New category"
              class="flex-1 p-2 rounded bg-gray-800 text-gray-100 border border-gray-700"
            />
          </div>

          <!-- File upload -->
          <input
            type="file"
            @change="onFileChange"
            accept="audio/*"
            class="p-2 rounded bg-gray-800 text-gray-100 border border-gray-700"
          />

          <!-- Volume slider -->
          <div class="flex flex-col gap-1 mt-2">
            <label class="text-gray-300 text-sm">Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              v-model="modalForm.volume"
              class="w-full accent-blue-600"
            />
          </div>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <!-- Left side: Reset -->
          <button
            @click="modalForm.volume = volumeToSlider(1)"
           class="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded"

          >
            Reset volume
          </button>

          <!-- Right side: Cancel + Save -->
          <div class="flex gap-2">
            <button
              @click="closeModal"
              class="cursor-pointer bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
            >
              Cancel
            </button>

            <button
              @click="saveSound"
              class="cursor-pointer bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              {{ editingSound ? "Save" : "Add" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deleteModalOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-gray-900 p-6 rounded shadow-lg w-80">
        <h2 class="text-lg font-bold mb-4">Confirm Delete</h2>
        <p class="mb-4">
          Are you sure you want to delete "{{ soundToDelete?.title }}"?
        </p>
        <div class="flex justify-end gap-2">
          <button
            @click="deleteModalOpen = false"
            class="cursor-pointer bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
          >
            Cancel
          </button>
          <button
            @click="deleteSound"
            class="cursor-pointer bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Context Menu -->
  <div
    v-if="rightClickedSound"
    class="absolute bg-gray-900 shadow-lg rounded-md border border-gray-700 w-40 z-50"
    :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
  >
    <ul class="flex flex-col">
      <li>
        <button
          @click="playSound(rightClickedSound.id)"
          class="block text-left cursor-pointer w-full px-4 py-2 text-gray-200 hover:bg-gray-800 hover:text-white"
        >
          Play
        </button>
      </li>

      <li>
        <button
          @click="openEditModal(rightClickedSound)"
          class="block text-left cursor-pointer w-full px-4 py-2 text-gray-200 hover:bg-gray-800 hover:text-white"
        >
          Edit
        </button>
      </li>

      <li>
        <a
          :href="getSoundURL(rightClickedSound.filename)"
          target="_blank"
          rel="noopener noreferrer"
          class="block text-left cursor-pointer w-full px-4 py-2 text-gray-200 hover:bg-gray-800 hover:text-white"
        >
          Download
        </a>
      </li>

      <li>
        <button
          @click="confirmDelete(rightClickedSound)"
          class="block text-left cursor-pointer w-full px-4 py-2 text-red-400 hover:bg-red-900 hover:text-red-300"
        >
          Delete
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, onMounted } from "vue";
import type { Sound } from "./clients/http-client";
import {
  getAllSounds,
  createSound,
  updateSound,
  deleteSound as apiDeleteSound,
  getSoundURL,
} from "./clients/http-client";
import { wsEvents } from "./event";
import {
  disconnectChannel,
  MessageType,
  playSound,
  stopSound,
} from "./clients/ws-client";
import type { SoundboardChannel } from "./types/soundboard-channel";

// ----------------------
// Channel list
// ----------------------
const soundboardChannels = ref<SoundboardChannel[]>([]);
const channelSelectorOpen = ref(false);
const selectedChannel = ref(soundboardChannels.value[0] || null);

wsEvents.on(MessageType.ChannelList, (channels: SoundboardChannel[]) => {
  soundboardChannels.value = channels;
  if (soundboardChannels.value.length > 0) {
    selectedChannel.value = soundboardChannels.value[0]!;
  } else {
    selectedChannel.value = null;
  }
});

// ----------------------
// Sounds
// ----------------------
const sounds = ref<Sound[]>([]);

async function loadSounds() {
  sounds.value = await getAllSounds();
}

onMounted(loadSounds);

const categories = computed(() => {
  const allCategories = sounds.value.map((s) => s.category);
  const uniqueCategories = Array.from(new Set(allCategories));

  // Move "banaa" to the front if it exists
  const index = uniqueCategories.indexOf("");
  if (index > -1) {
    uniqueCategories.splice(index, 1);
    uniqueCategories.unshift("");
  }

  return uniqueCategories;
});

const rightClickedSound = ref<Sound | null>();

document.onclick = () => {
  rightClickedSound.value = null;
};

const contextMenuX = ref(0);
const contextMenuY = ref(0);
function rightClick(e: PointerEvent, sound: Sound) {
  e.preventDefault();
  rightClickedSound.value = sound;
  contextMenuX.value = e.pageX;
  contextMenuY.value = e.pageY;
}

// ----------------------
// Modal (Add/Edit)
// ----------------------
const modalOpen = ref(false);
const editingSound = ref<Sound | null>(null);

// modalForm holds text fields (title, author, category)
const modalForm = reactive({
  title: "",
  author: "",
  category: "",
  volume: 1,
});

// selectedFile holds the audio file for upload
const selectedFile = ref<File | null>(null);

const newCategory = ref("");

function openUploadModal() {
  modalOpen.value = true;
  editingSound.value = null;
  Object.assign(modalForm, { title: "", author: "", category: "", volume: volumeToSlider(1) });
  selectedFile.value = null;
  newCategory.value = "";
}

function openEditModal(sound: Sound) {
  console.log(sound);
  modalOpen.value = true;
  editingSound.value = sound;
  modalForm.title = sound.title;
  modalForm.author = sound.author;
  modalForm.category = sound.category;
  selectedFile.value = null;
  modalForm.volume = volumeToSlider(sound.volume);
  newCategory.value = "";
}

function closeModal() {
  modalOpen.value = false;
}

// Sound volume conversion between slider (0-100) and volume (0-10)
const minVolume = 0
const maxVolume = 10
const centerVolume = 1

function sliderToVolume(slider: number) {
  // slider: 0-100 → volume: 0-10 with center around 1
  const t = slider / 100 // 0-1
  // Simple exponential curve: t^2 * (max - min) + min
  if (t < 0.5) {
    // Map first half to 0 → centerVolume
    return minVolume + (centerVolume - minVolume) * (t / 0.5) ** 2
  } else {
    // Map second half to centerVolume → maxVolume
    return centerVolume + (maxVolume - centerVolume) * ((t - 0.5) / 0.5) ** 2
  }
}

function volumeToSlider(volume: number) {
  if (volume <= centerVolume) {
    return 50 * Math.sqrt((volume - minVolume) / (centerVolume - minVolume))
  } else {
    return 50 + 50 * Math.sqrt((volume - centerVolume) / (maxVolume - centerVolume))
  }
}

// Initialize slider position
modalForm.volume = volumeToSlider(1)

// ----------------------
// Save (Create / Update)
// ----------------------
async function saveSound() {
  // New category creation
  if (modalForm.category === "__new") {
    modalForm.category = newCategory.value.trim();
  }

  if (!editingSound.value) {
    // CREATE
    if (!selectedFile.value) return;

    await createSound({
      title: modalForm.title,
      author: modalForm.author,
      category: modalForm.category,
      volume: sliderToVolume(modalForm.volume),
      file: selectedFile.value,
    });
  } else {
    // UPDATE
    await updateSound(editingSound.value.id, {
      title: modalForm.title,
      author: modalForm.author,
      category: modalForm.category,
      volume: sliderToVolume(modalForm.volume),
      file: selectedFile.value || null,
    });
  }

  await loadSounds();
  modalOpen.value = false;
}

// ----------------------
// Delete confirmation
// ----------------------
const deleteModalOpen = ref(false);
const soundToDelete = ref<Sound | null>(null);

function confirmDelete(sound: Sound) {
  soundToDelete.value = sound;
  deleteModalOpen.value = true;
}

async function deleteSound() {
  if (soundToDelete.value) {
    await apiDeleteSound(soundToDelete.value.id);
    deleteModalOpen.value = false;
    await loadSounds();
  }
}

// ----------------------
// File upload handler
// ----------------------
function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) selectedFile.value = file;
}

// ----------------------
// WebSocket Events
// ----------------------
wsEvents.on(MessageType.AddSound, (soundId: Sound) => {
  if (!sounds.value.find((s) => s.id === soundId.id)) {
    sounds.value.push(soundId);
  }
});

wsEvents.on(MessageType.EditSound, (updatedSound: Sound) => {
  const index = sounds.value.findIndex((s) => s.id === updatedSound.id);
  if (index !== -1) {
    sounds.value[index] = updatedSound;
  }
});

wsEvents.on(MessageType.DeleteSound, (soundId: number) => {
  sounds.value = sounds.value.filter((s) => s.id !== soundId);
});
</script>
